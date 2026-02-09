"""Notification models and logging."""
from django.db import models
from django.contrib.auth import get_user_model

from core.models import TimeStampedModel

User = get_user_model()


class NotificationLog(TimeStampedModel):
	"""Log for outgoing notifications."""

	class Channel(models.TextChoices):
		EMAIL = 'EMAIL', 'Email'
		SMS = 'SMS', 'SMS'

	class Status(models.TextChoices):
		PENDING = 'PENDING', 'Pending'
		SENT = 'SENT', 'Sent'
		FAILED = 'FAILED', 'Failed'
		SKIPPED = 'SKIPPED', 'Skipped'

	channel = models.CharField(max_length=10, choices=Channel.choices)
	status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
	recipient_email = models.EmailField(blank=True, null=True)
	recipient_phone = models.CharField(max_length=20, blank=True, null=True)
	subject = models.CharField(max_length=200, blank=True)
	message = models.TextField()
	error_message = models.TextField(blank=True)
	metadata = models.JSONField(default=dict, blank=True)
	created_by = models.ForeignKey(
		User,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name='notifications_sent'
	)

	class Meta:
		db_table = 'notification_logs'
		ordering = ['-created_at']

	def __str__(self):
		recipient = self.recipient_email or self.recipient_phone or 'Unknown'
		return f'{self.channel} to {recipient} ({self.status})'


class NotificationSetting(TimeStampedModel):
	"""Configurable notification settings (single row)."""

	email_enabled = models.BooleanField(default=True)
	sms_enabled = models.BooleanField(default=False)
	from_email = models.EmailField(blank=True, null=True)
	sms_provider = models.CharField(max_length=50, default='none')

	class Meta:
		db_table = 'notification_settings'
		ordering = ['-created_at']

	def __str__(self):
		return 'Notification Settings'