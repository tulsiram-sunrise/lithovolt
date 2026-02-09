"""Order models for consumer requests."""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

from core.models import TimeStampedModel
from apps.inventory.models import BatteryModel, Accessory

User = get_user_model()


class Order(TimeStampedModel):
	"""Order request from consumer."""

	class Status(models.TextChoices):
		PENDING = 'PENDING', 'Pending'
		ACCEPTED = 'ACCEPTED', 'Accepted'
		REJECTED = 'REJECTED', 'Rejected'
		FULFILLED = 'FULFILLED', 'Fulfilled'
		CANCELLED = 'CANCELLED', 'Cancelled'

	consumer = models.ForeignKey(
		User,
		on_delete=models.CASCADE,
		related_name='orders'
	)
	wholesaler = models.ForeignKey(
		User,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name='assigned_orders'
	)
	status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
	notes = models.TextField(blank=True)
	accepted_at = models.DateTimeField(null=True, blank=True)
	fulfilled_at = models.DateTimeField(null=True, blank=True)

	class Meta:
		db_table = 'orders'
		ordering = ['-created_at']

	def __str__(self):
		return f'Order {self.id} ({self.status})'

	@property
	def total_items(self):
		return sum(item.quantity for item in self.items.all())

	def mark_accepted(self, wholesaler=None):
		if wholesaler:
			self.wholesaler = wholesaler
		self.status = self.Status.ACCEPTED
		self.accepted_at = timezone.now()
		self.save(update_fields=['wholesaler', 'status', 'accepted_at'])

	def mark_rejected(self):
		self.status = self.Status.REJECTED
		self.save(update_fields=['status'])

	def mark_fulfilled(self):
		self.status = self.Status.FULFILLED
		self.fulfilled_at = timezone.now()
		self.save(update_fields=['status', 'fulfilled_at'])

	def mark_cancelled(self):
		self.status = self.Status.CANCELLED
		self.save(update_fields=['status'])


class OrderItem(TimeStampedModel):
	"""Items included in an order request."""

	class ProductType(models.TextChoices):
		BATTERY_MODEL = 'BATTERY_MODEL', 'Battery Model'
		ACCESSORY = 'ACCESSORY', 'Accessory'

	order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
	product_type = models.CharField(max_length=20, choices=ProductType.choices)
	battery_model = models.ForeignKey(
		BatteryModel,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name='order_items'
	)
	accessory = models.ForeignKey(
		Accessory,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name='order_items'
	)
	quantity = models.PositiveIntegerField(default=1)
	unit_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

	class Meta:
		db_table = 'order_items'
		ordering = ['-created_at']

	def __str__(self):
		return f'Item {self.id} ({self.product_type})'
