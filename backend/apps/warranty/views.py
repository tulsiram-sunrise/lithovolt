"""Warranty API views."""
import csv

from django.conf import settings
from django.db import transaction
from django.http import FileResponse, HttpResponse
from django.shortcuts import get_object_or_404
from django.urls import reverse
from django.utils import timezone
from django.utils.dateparse import parse_date

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from core.permissions import IsAdmin, IsAdminOrWholesaler
from core.utils import format_phone_number
from apps.inventory.models import SerialNumber
from django.contrib.auth import get_user_model

from .models import Warranty, WarrantyClaim, WarrantyClaimAttachment
from .serializers import (
    WarrantySerializer,
    WarrantyIssueSerializer,
    WarrantyClaimSerializer,
    WarrantyPublicSerializer,
    WarrantyClaimCreateSerializer,
    WarrantyClaimDetailSerializer,
)
from apps.notifications.services import send_warranty_confirmation
from apps.notifications.tasks import send_warranty_confirmation_task
from .tasks import generate_warranty_assets_task

User = get_user_model()


def get_or_create_consumer(email=None, phone=None, first_name=None, last_name=None):
    """Find or create a consumer user based on email/phone."""
    user = None
    if email:
        user = User.objects.filter(email=email).first()
    if not user and phone:
        user = User.objects.filter(phone=phone).first()

    if user:
        updated_fields = []
        if email and not user.email:
            user.email = email
            updated_fields.append('email')
        if phone and not user.phone:
            user.phone = phone
            updated_fields.append('phone')
        if first_name and not user.first_name:
            user.first_name = first_name
            updated_fields.append('first_name')
        if last_name and not user.last_name:
            user.last_name = last_name
            updated_fields.append('last_name')
        if updated_fields:
            user.save(update_fields=updated_fields)
        return user, False

    if phone:
        phone = format_phone_number(phone)

    user = User.objects.create_user(
        email=email,
        phone=phone,
        first_name=first_name or 'Consumer',
        last_name=last_name or '',
        role='CONSUMER'
    )
    return user, True


class WarrantyViewSet(viewsets.ReadOnlyModelViewSet):
    """View warranties by role and issue/claim actions."""

    queryset = Warranty.objects.select_related('serial_number', 'consumer', 'issued_by')
    serializer_class = WarrantySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['warranty_number', 'serial_number__serial_number']
    ordering_fields = ['created_at', 'start_date', 'end_date']

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return self.queryset
        if user.is_wholesaler:
            return self.queryset.filter(issued_by=user)
        if user.is_consumer:
            return self.queryset.filter(consumer=user)
        return self.queryset.none()

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    @transaction.atomic
    def claim(self, request):
        """Claim/activate warranty by serial number (consumer)."""
        serializer = WarrantyClaimSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        serial_number = serializer.validated_data['serial_number']
        email = serializer.validated_data.get('consumer_email')
        phone = serializer.validated_data.get('consumer_phone')
        first_name = serializer.validated_data.get('consumer_first_name')
        last_name = serializer.validated_data.get('consumer_last_name')

        serial = get_object_or_404(SerialNumber, serial_number=serial_number)

        existing = Warranty.objects.filter(serial_number=serial).first()
        if existing:
            if email and existing.consumer and existing.consumer.email and existing.consumer.email != email:
                return Response({'error': 'Warranty already claimed by another consumer'}, status=status.HTTP_409_CONFLICT)
            if phone and existing.consumer and existing.consumer.phone and existing.consumer.phone != phone:
                return Response({'error': 'Warranty already claimed by another consumer'}, status=status.HTTP_409_CONFLICT)
            return Response(WarrantySerializer(existing).data)

        consumer, _ = get_or_create_consumer(email, phone, first_name, last_name)

        if serial.status != SerialNumber.Status.SOLD:
            serial.status = SerialNumber.Status.SOLD
            serial.sold_to = consumer
            serial.sold_at = timezone.now()
            serial.save(update_fields=['status', 'sold_to', 'sold_at'])

        warranty = Warranty.objects.create(
            serial_number=serial,
            consumer=consumer,
            issued_by=serial.allocated_to,
            notes='Claimed by consumer'
        )

        verify_url = request.build_absolute_uri(
            reverse('warranty-verify', kwargs={'serial_number': serial.serial_number})
        )
        if getattr(settings, 'ASYNC_TASKS_ENABLED', False):
            generate_warranty_assets_task.delay(warranty.id, verify_url)
            send_warranty_confirmation_task.delay(warranty.id)
        else:
            warranty.generate_assets(verify_url)
            warranty.save()
            try:
                send_warranty_confirmation(warranty)
            except Exception:
                pass

        return Response(WarrantySerializer(warranty).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], permission_classes=[IsAdminOrWholesaler])
    @transaction.atomic
    def issue(self, request):
        """Issue warranty on sale (admin/wholesaler)."""
        serializer = WarrantyIssueSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        serial_number = serializer.validated_data['serial_number']
        email = serializer.validated_data.get('consumer_email')
        phone = serializer.validated_data.get('consumer_phone')
        first_name = serializer.validated_data.get('consumer_first_name')
        last_name = serializer.validated_data.get('consumer_last_name')
        notes = serializer.validated_data.get('notes', '')

        serial = get_object_or_404(SerialNumber, serial_number=serial_number)

        if request.user.is_wholesaler and serial.allocated_to_id != request.user.id:
            return Response({'error': 'Serial not allocated to this wholesaler'}, status=status.HTTP_403_FORBIDDEN)

        existing = Warranty.objects.filter(serial_number=serial).first()
        if existing:
            return Response(WarrantySerializer(existing).data)

        consumer, _ = get_or_create_consumer(email, phone, first_name, last_name)

        serial.status = SerialNumber.Status.SOLD
        serial.sold_to = consumer
        serial.sold_at = timezone.now()
        serial.save(update_fields=['status', 'sold_to', 'sold_at'])

        warranty = Warranty.objects.create(
            serial_number=serial,
            consumer=consumer,
            issued_by=request.user,
            notes=notes
        )

        verify_url = request.build_absolute_uri(
            reverse('warranty-verify', kwargs={'serial_number': serial.serial_number})
        )
        if getattr(settings, 'ASYNC_TASKS_ENABLED', False):
            generate_warranty_assets_task.delay(warranty.id, verify_url)
            send_warranty_confirmation_task.delay(warranty.id)
        else:
            warranty.generate_assets(verify_url)
            warranty.save()
            try:
                send_warranty_confirmation(warranty)
            except Exception:
                pass

        return Response(WarrantySerializer(warranty).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def certificate(self, request, pk=None):
        """Download warranty certificate PDF."""
        warranty = self.get_object()
        if not warranty.certificate_file:
            return Response({'error': 'Certificate not generated'}, status=status.HTTP_404_NOT_FOUND)
        return FileResponse(warranty.certificate_file.open('rb'), filename=warranty.certificate_file.name)

    @action(detail=False, methods=['get'], permission_classes=[IsAdmin])
    def export(self, request):
        """Export warranties as CSV (admin only)."""
        status_param = request.query_params.get('status')
        date_from_raw = request.query_params.get('from')
        date_to_raw = request.query_params.get('to')
        date_from = parse_date(date_from_raw) if date_from_raw else None
        date_to = parse_date(date_to_raw) if date_to_raw else None

        queryset = self.queryset
        if status_param:
            queryset = queryset.filter(status=status_param)
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="warranties.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'warranty_number', 'serial_number', 'battery_model', 'consumer_email',
            'status', 'start_date', 'end_date', 'issued_by', 'created_at'
        ])

        for warranty in queryset:
            writer.writerow([
                warranty.warranty_number,
                warranty.serial_number.serial_number,
                warranty.battery_model.name,
                warranty.consumer.email if warranty.consumer else '',
                warranty.status,
                warranty.start_date.isoformat(),
                warranty.end_date.isoformat() if warranty.end_date else '',
                warranty.issued_by.email if warranty.issued_by else '',
                warranty.created_at.isoformat(),
            ])

        return response


class WarrantyClaimViewSet(viewsets.ModelViewSet):
    """Warranty claim workflow APIs with status transitions."""

    queryset = WarrantyClaim.objects.select_related('warranty', 'consumer', 'warranty__serial_number', 'assigned_to', 'reviewed_by').prefetch_related('attachments')
    serializer_class = WarrantyClaimDetailSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['warranty__warranty_number', 'warranty__serial_number__serial_number']
    ordering_fields = ['created_at']

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return self.queryset
        if user.is_wholesaler:
            return self.queryset.filter(warranty__issued_by=user)
        return self.queryset.filter(consumer=user)

    def get_serializer_class(self):
        if self.action == 'create':
            return WarrantyClaimCreateSerializer
        return WarrantyClaimDetailSerializer

    def create(self, request, *args, **kwargs):
        if not request.user.is_consumer and not request.user.is_admin:
            return Response({'error': 'Only consumers can create claims'}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        warranty_number = serializer.validated_data.get('warranty_number')
        serial_number = serializer.validated_data.get('serial_number')
        description = serializer.validated_data.get('description', '')

        if warranty_number:
            warranty = get_object_or_404(Warranty, warranty_number=warranty_number)
        else:
            warranty = get_object_or_404(Warranty, serial_number__serial_number=serial_number)

        claim = WarrantyClaim.objects.create(
            warranty=warranty,
            consumer=request.user,
            description=description
        )

        for attachment in request.FILES.getlist('attachments'):
            WarrantyClaimAttachment.objects.create(claim=claim, file=attachment)

        return Response(
            WarrantyClaimDetailSerializer(claim, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def assign(self, request, pk=None):
        """Assign a claim to a staff member and transition to UNDER_REVIEW."""
        claim = self.get_object()
        staff_user_id = request.data.get('assigned_to')
        
        if not staff_user_id:
            return Response({'error': 'assigned_to field is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        staff_user = get_object_or_404(User, id=staff_user_id)
        if not (staff_user.is_admin or hasattr(staff_user, 'staff_profile')):
            return Response({'error': 'User is not a staff member'}, status=status.HTTP_400_BAD_REQUEST)
        
        claim.assigned_to = staff_user
        try:
            claim.update_status(
                WarrantyClaim.Status.UNDER_REVIEW,
                reviewed_by=request.user,
                review_notes=request.data.get('review_notes', '')
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(WarrantyClaimDetailSerializer(claim).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        """Approve a warranty claim."""
        claim = self.get_object()
        try:
            claim.update_status(
                WarrantyClaim.Status.APPROVED,
                reviewed_by=request.user,
                review_notes=request.data.get('review_notes', '')
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(WarrantyClaimDetailSerializer(claim).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def reject(self, request, pk=None):
        """Reject a warranty claim."""
        claim = self.get_object()
        try:
            claim.update_status(
                WarrantyClaim.Status.REJECTED,
                reviewed_by=request.user,
                review_notes=request.data.get('review_notes', '')
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(WarrantyClaimDetailSerializer(claim).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def resolve(self, request, pk=None):
        """Mark a claim as resolved."""
        claim = self.get_object()
        try:
            claim.update_status(
                WarrantyClaim.Status.RESOLVED,
                reviewed_by=request.user,
                review_notes=request.data.get('review_notes', '')
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(WarrantyClaimDetailSerializer(claim).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def verify_warranty(request, serial_number):
    """Public warranty verification endpoint."""
    warranty = get_object_or_404(
        Warranty.objects.select_related('serial_number', 'consumer', 'serial_number__battery_model'),
        serial_number__serial_number=serial_number
    )
    serializer = WarrantyPublicSerializer(warranty)
    return Response(serializer.data)
