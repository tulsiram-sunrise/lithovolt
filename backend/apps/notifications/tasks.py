"""Celery tasks for notifications."""
from celery import shared_task

from .services import log_and_send, send_warranty_confirmation
from .models import NotificationLog


@shared_task
def send_notification_task(channel, recipient_email, recipient_phone, subject, message, created_by_id=None, metadata=None):
    return log_and_send(
        channel=channel,
        recipient_email=recipient_email,
        recipient_phone=recipient_phone,
        subject=subject,
        message=message,
        created_by_id=created_by_id,
        metadata=metadata
    )


@shared_task
def send_warranty_confirmation_task(warranty_id):
    from apps.warranty.models import Warranty

    warranty = Warranty.objects.filter(id=warranty_id).first()
    if not warranty:
        return None
    return send_warranty_confirmation(warranty)
