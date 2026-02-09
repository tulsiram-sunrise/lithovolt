"""Inventory API views."""
from django.db import transaction
from django.db.models import Count, Q, F
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from core.permissions import IsAdmin, IsAdminOrWholesaler
from apps.notifications.models import NotificationLog
from apps.notifications.services import log_and_send
from apps.notifications.tasks import send_notification_task
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import BatteryModel, Accessory, SerialNumber, StockAllocation
from .serializers import (
	BatteryModelSerializer,
	AccessorySerializer,
	SerialNumberSerializer,
	SerialBatchCreateSerializer,
	StockAllocationSerializer,
	StockAllocationCreateSerializer,
)


class BatteryModelViewSet(viewsets.ModelViewSet):
	"""CRUD for battery models."""

	queryset = BatteryModel.objects.all()
	serializer_class = BatteryModelSerializer
	filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
	filterset_fields = ['is_active']
	search_fields = ['name', 'sku', 'model_number']
	ordering_fields = ['created_at', 'name', 'sku']

	def get_permissions(self):
		if self.action in ['create', 'update', 'partial_update', 'destroy']:
			return [IsAdmin()]
		return [IsAuthenticated()]

	@action(detail=False, methods=['get'], permission_classes=[IsAdmin])
	def low_stock(self, request):
		"""List battery models below low stock threshold (admin)."""
		threshold = request.query_params.get('threshold')
		qs = self.queryset.annotate(
			available_count=Count(
				'serial_numbers',
				filter=Q(serial_numbers__status=SerialNumber.Status.AVAILABLE)
			)
		)
		if threshold is not None:
			qs = qs.filter(available_count__lte=int(threshold))
		else:
			qs = qs.filter(available_count__lte=F('low_stock_threshold'))
		serializer = BatteryModelSerializer(qs, many=True)
		return Response(serializer.data)

	@action(detail=False, methods=['post'], permission_classes=[IsAdmin])
	def notify_low_stock(self, request):
		"""Send low stock alerts to admin users."""
		threshold = request.data.get('threshold')
		qs = self.queryset.annotate(
			available_count=Count(
				'serial_numbers',
				filter=Q(serial_numbers__status=SerialNumber.Status.AVAILABLE)
			)
		)
		if threshold is not None:
			qs = qs.filter(available_count__lte=int(threshold))
		else:
			qs = qs.filter(available_count__lte=F('low_stock_threshold'))

		items = list(qs)
		if not items:
			return Response({'message': 'No low stock items found'})

		User = get_user_model()
		admins = User.objects.filter(role='ADMIN', is_active=True).exclude(email__isnull=True)
		lines = ['Low stock alert:']
		for model in items:
			lines.append(
				f'{model.name} ({model.sku}) - available {model.available_stock}, threshold {model.low_stock_threshold}'
			)
		message = '\n'.join(lines)
		sent = 0
		for admin in admins:
			if getattr(settings, 'ASYNC_TASKS_ENABLED', False):
				send_notification_task.delay(
					channel=NotificationLog.Channel.EMAIL,
					recipient_email=admin.email,
					recipient_phone=None,
					subject='Low Stock Alert',
					message=message,
					created_by_id=request.user.id,
					metadata={'low_stock_count': len(items)}
				)
			else:
				log_and_send(
					channel=NotificationLog.Channel.EMAIL,
					recipient_email=admin.email,
					recipient_phone=None,
					subject='Low Stock Alert',
					message=message,
					created_by=request.user,
					metadata={'low_stock_count': len(items)}
				)
			sent += 1

		return Response({'message': 'Low stock alerts sent', 'recipients': sent})


class SerialNumberViewSet(viewsets.ReadOnlyModelViewSet):
	"""View serial numbers and generate batches."""

	queryset = SerialNumber.objects.select_related('battery_model')
	serializer_class = SerialNumberSerializer
	filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
	filterset_fields = ['status', 'battery_model']
	search_fields = ['serial_number']
	ordering_fields = ['created_at', 'serial_number']

	def get_permissions(self):
		if self.action == 'generate':
			return [IsAdmin()]
		return [IsAdminOrWholesaler()]

	def get_queryset(self):
		user = self.request.user
		if user.is_admin:
			return self.queryset
		if user.is_wholesaler:
			return self.queryset.filter(allocated_to=user)
		return self.queryset.none()

	@action(detail=False, methods=['post'])
	def generate(self, request):
		"""Generate a batch of serial numbers for a battery model."""
		serializer = SerialBatchCreateSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		battery_model = BatteryModel.objects.get(id=serializer.validated_data['battery_model_id'])
		quantity = serializer.validated_data['quantity']
		prefix = serializer.validated_data.get('prefix', 'LV')

		created_serials = SerialNumber.create_batch(battery_model, quantity, prefix)
		return Response(
			{
				'message': 'Serial numbers generated successfully',
				'count': len(created_serials)
			},
			status=status.HTTP_201_CREATED
		)


class AccessoryViewSet(viewsets.ModelViewSet):
	"""CRUD for accessories."""

	queryset = Accessory.objects.all()
	serializer_class = AccessorySerializer
	filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
	filterset_fields = ['is_active']
	search_fields = ['name', 'sku']
	ordering_fields = ['created_at', 'name', 'sku']

	def get_permissions(self):
		if self.action in ['create', 'update', 'partial_update', 'destroy']:
			return [IsAdmin()]
		return [IsAuthenticated()]


class StockAllocationViewSet(viewsets.ModelViewSet):
	"""Allocate stock to wholesalers and view allocations."""

	queryset = StockAllocation.objects.select_related('battery_model', 'wholesaler')
	serializer_class = StockAllocationSerializer
	filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
	filterset_fields = ['battery_model', 'wholesaler']
	search_fields = ['battery_model__name', 'wholesaler__email']
	ordering_fields = ['created_at', 'quantity']

	def get_permissions(self):
		if self.action in ['create', 'update', 'partial_update', 'destroy']:
			return [IsAdmin()]
		return [IsAdminOrWholesaler()]

	def get_queryset(self):
		user = self.request.user
		if user.is_admin:
			return self.queryset
		if user.is_wholesaler:
			return self.queryset.filter(wholesaler=user)
		return self.queryset.none()

	def get_serializer_class(self):
		if self.action == 'create':
			return StockAllocationCreateSerializer
		return StockAllocationSerializer

	@transaction.atomic
	def create(self, request, *args, **kwargs):
		"""Allocate available serial numbers to a wholesaler."""
		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		battery_model = BatteryModel.objects.get(id=serializer.validated_data['battery_model_id'])
		wholesaler_id = serializer.validated_data['wholesaler_id']
		quantity = serializer.validated_data['quantity']
		notes = serializer.validated_data.get('notes', '')

		available_serials = SerialNumber.objects.select_for_update().filter(
			battery_model=battery_model,
			status=SerialNumber.Status.AVAILABLE
		).order_by('created_at')

		if available_serials.count() < quantity:
			return Response(
				{'error': 'Not enough available stock to allocate'},
				status=status.HTTP_400_BAD_REQUEST
			)

		serials_to_allocate = available_serials[:quantity]

		updated_ids = list(serials_to_allocate.values_list('id', flat=True))
		SerialNumber.objects.filter(id__in=updated_ids).update(
			status=SerialNumber.Status.ALLOCATED,
			allocated_to_id=wholesaler_id,
			allocated_at=timezone.now()
		)

		allocation = StockAllocation.objects.create(
			battery_model=battery_model,
			wholesaler_id=wholesaler_id,
			allocated_by=request.user,
			quantity=quantity,
			notes=notes
		)

		output_serializer = StockAllocationSerializer(allocation)
		return Response(output_serializer.data, status=status.HTTP_201_CREATED)