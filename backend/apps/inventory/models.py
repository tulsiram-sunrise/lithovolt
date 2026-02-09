"""Inventory models for battery tracking and allocation."""
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model

from core.models import TimeStampedModel
from core.utils import generate_serial_number

User = get_user_model()


class BatteryModel(TimeStampedModel):
	"""Battery model master data."""

	name = models.CharField(max_length=200)
	sku = models.CharField(max_length=100, unique=True)
	model_number = models.CharField(max_length=100, blank=True)
	capacity_ah = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
	voltage = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
	warranty_months = models.PositiveIntegerField(default=0)
	low_stock_threshold = models.PositiveIntegerField(default=5)
	description = models.TextField(blank=True)
	is_active = models.BooleanField(default=True)

	class Meta:
		db_table = 'battery_models'
		ordering = ['-created_at']

	def __str__(self):
		return f'{self.name} ({self.sku})'

	@property
	def total_stock(self):
		return self.serial_numbers.count()

	@property
	def available_stock(self):
		return self.serial_numbers.filter(status=SerialNumber.Status.AVAILABLE).count()

	@property
	def allocated_stock(self):
		return self.serial_numbers.filter(status=SerialNumber.Status.ALLOCATED).count()

	@property
	def sold_stock(self):
		return self.serial_numbers.filter(status=SerialNumber.Status.SOLD).count()


class Accessory(TimeStampedModel):
	"""Accessory catalog items."""

	name = models.CharField(max_length=200)
	sku = models.CharField(max_length=100, unique=True)
	description = models.TextField(blank=True)
	price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
	is_active = models.BooleanField(default=True)

	class Meta:
		db_table = 'accessories'
		ordering = ['-created_at']

	def __str__(self):
		return f'{self.name} ({self.sku})'


class SerialNumber(TimeStampedModel):
	"""Individual battery serial number tracking."""

	class Status(models.TextChoices):
		AVAILABLE = 'AVAILABLE', 'Available'
		ALLOCATED = 'ALLOCATED', 'Allocated'
		SOLD = 'SOLD', 'Sold'

	battery_model = models.ForeignKey(
		BatteryModel,
		on_delete=models.CASCADE,
		related_name='serial_numbers'
	)
	serial_number = models.CharField(max_length=50, unique=True, db_index=True)
	status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)
	allocated_to = models.ForeignKey(
		User,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name='allocated_serials'
	)
	allocated_at = models.DateTimeField(null=True, blank=True)
	sold_to = models.ForeignKey(
		User,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name='purchased_serials'
	)
	sold_at = models.DateTimeField(null=True, blank=True)

	class Meta:
		db_table = 'battery_serial_numbers'
		ordering = ['-created_at']

	def __str__(self):
		return self.serial_number

	@classmethod
	def create_batch(cls, battery_model, quantity, prefix='LV'):
		"""Create a batch of serial numbers for a battery model."""
		serials = []
		for _ in range(quantity):
			serials.append(
				cls(
					battery_model=battery_model,
					serial_number=generate_serial_number(prefix=prefix)
				)
			)
		return cls.objects.bulk_create(serials)

	def allocate_to(self, wholesaler):
		"""Mark this serial as allocated to a wholesaler."""
		self.status = self.Status.ALLOCATED
		self.allocated_to = wholesaler
		self.allocated_at = timezone.now()
		self.save(update_fields=['status', 'allocated_to', 'allocated_at'])

	def mark_sold(self, consumer):
		"""Mark this serial as sold to a consumer."""
		self.status = self.Status.SOLD
		self.sold_to = consumer
		self.sold_at = timezone.now()
		self.save(update_fields=['status', 'sold_to', 'sold_at'])


class StockAllocation(TimeStampedModel):
	"""Allocation of serial numbers to wholesalers."""

	battery_model = models.ForeignKey(
		BatteryModel,
		on_delete=models.CASCADE,
		related_name='allocations'
	)
	wholesaler = models.ForeignKey(
		User,
		on_delete=models.CASCADE,
		related_name='stock_allocations'
	)
	allocated_by = models.ForeignKey(
		User,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name='stock_allocations_created'
	)
	quantity = models.PositiveIntegerField()
	notes = models.TextField(blank=True)

	class Meta:
		db_table = 'stock_allocations'
		ordering = ['-created_at']

	def __str__(self):
		return f'{self.battery_model} -> {self.wholesaler} ({self.quantity})'
