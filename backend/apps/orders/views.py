"""Order API views."""
import csv
from io import BytesIO

from django.db import transaction, models
from django.http import HttpResponse
from django.utils.dateparse import parse_date
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from core.permissions import IsAdmin
from apps.inventory.models import BatteryModel, Accessory

from .models import Order, OrderItem
from .serializers import (
    OrderSerializer,
    OrderCreateSerializer,
    OrderItemSerializer,
)
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


class OrderViewSet(viewsets.ModelViewSet):
    """Order request endpoints."""

    queryset = Order.objects.select_related('consumer', 'wholesaler').prefetch_related('items')
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['id']
    ordering_fields = ['created_at', 'accepted_at', 'fulfilled_at']

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return self.queryset
        if user.is_wholesaler:
            return self.queryset.filter(consumer=user)
        return self.queryset.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        if self.action == 'items':
            return OrderItemSerializer
        return OrderSerializer

    def destroy(self, request, *args, **kwargs):
        order = self.get_object()
        if order.status not in [Order.Status.PENDING, Order.Status.CANCELLED]:
            return Response({'error': 'Only pending/cancelled orders can be deleted'}, status=status.HTTP_400_BAD_REQUEST)
        return super().destroy(request, *args, **kwargs)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        if not request.user.is_wholesaler and not request.user.is_admin:
            return Response({'error': 'Only wholesalers can create orders'}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        notes = serializer.validated_data.get('notes', '')
        items_data = serializer.validated_data['items']

        order = Order.objects.create(
            consumer=request.user,
            notes=notes
        )

        order_items = []
        for item in items_data:
            product_type = item['product_type']
            quantity = item['quantity']
            battery_model = None
            accessory = None
            unit_price = None

            if product_type == OrderItem.ProductType.BATTERY_MODEL:
                battery_model = BatteryModel.objects.get(id=item['battery_model_id'])
            elif product_type == OrderItem.ProductType.ACCESSORY:
                accessory = Accessory.objects.get(id=item['accessory_id'])
                unit_price = accessory.price

            order_items.append(
                OrderItem(
                    order=order,
                    product_type=product_type,
                    battery_model=battery_model,
                    accessory=accessory,
                    quantity=quantity,
                    unit_price=unit_price
                )
            )

        OrderItem.objects.bulk_create(order_items)

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def items(self, request, pk=None):
        order = self.get_object()
        serializer = OrderItemSerializer(order.items.all(), many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def accept(self, request, pk=None):
        order = self.get_object()
        if order.status != Order.Status.PENDING:
            return Response({'error': 'Only pending orders can be accepted'}, status=status.HTTP_400_BAD_REQUEST)

        order.mark_accepted()
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def reject(self, request, pk=None):
        order = self.get_object()
        if order.status != Order.Status.PENDING:
            return Response({'error': 'Only pending orders can be rejected'}, status=status.HTTP_400_BAD_REQUEST)
        order.mark_rejected()
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def fulfill(self, request, pk=None):
        order = self.get_object()
        if order.status not in [Order.Status.ACCEPTED, Order.Status.PENDING]:
            return Response({'error': 'Order must be accepted or pending to fulfill'}, status=status.HTTP_400_BAD_REQUEST)
        order.mark_fulfilled()
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if request.user != order.consumer and not request.user.is_admin:
            return Response({'error': 'Not allowed to cancel this order'}, status=status.HTTP_403_FORBIDDEN)
        if order.status not in [Order.Status.PENDING, Order.Status.ACCEPTED]:
            return Response({'error': 'Only pending or accepted orders can be cancelled'}, status=status.HTTP_400_BAD_REQUEST)
        order.mark_cancelled()
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def invoice(self, request, pk=None):
        """Generate order invoice PDF."""
        order = self.get_object()
        if request.user.is_wholesaler and order.consumer_id != request.user.id:
            return Response({'error': 'Not allowed to access this invoice'}, status=status.HTTP_403_FORBIDDEN)

        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=A4)
        pdf.setTitle(f'Invoice - Order {order.id}')

        pdf.setFont('Helvetica-Bold', 16)
        pdf.drawString(50, 800, f'Invoice - Order #{order.id}')
        pdf.setFont('Helvetica', 12)
        pdf.drawString(50, 780, f'Status: {order.status}')
        pdf.drawString(50, 760, f'Consumer: {order.consumer.get_full_name()}')
        if order.consumer.email:
            pdf.drawString(50, 740, f'Email: {order.consumer.email}')
        if order.consumer.phone:
            pdf.drawString(50, 720, f'Phone: {order.consumer.phone}')

        pdf.drawString(50, 690, 'Items:')
        y = 670
        pdf.setFont('Helvetica', 11)
        for item in order.items.all():
            name = item.battery_model.name if item.battery_model else item.accessory.name
            pdf.drawString(60, y, f'- {name} x {item.quantity}')
            y -= 18
            if y < 100:
                pdf.showPage()
                y = 800

        pdf.showPage()
        pdf.save()

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="invoice_{order.id}.pdf"'
        response.write(buffer.getvalue())
        return response

    @action(detail=False, methods=['get'], permission_classes=[IsAdmin])
    def export(self, request):
        """Export orders as CSV (admin only)."""
        status = request.query_params.get('status')
        date_from_raw = request.query_params.get('from')
        date_to_raw = request.query_params.get('to')
        date_from = parse_date(date_from_raw) if date_from_raw else None
        date_to = parse_date(date_to_raw) if date_to_raw else None

        queryset = self.queryset
        if status:
            queryset = queryset.filter(status=status)
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="orders.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'id', 'consumer_email', 'wholesaler_email', 'status',
            'created_at', 'accepted_at', 'fulfilled_at', 'total_items'
        ])

        for order in queryset:
            writer.writerow([
                order.id,
                order.consumer.email,
                order.wholesaler.email if order.wholesaler else '',
                order.status,
                order.created_at.isoformat(),
                order.accepted_at.isoformat() if order.accepted_at else '',
                order.fulfilled_at.isoformat() if order.fulfilled_at else '',
                order.total_items
            ])

        return response
