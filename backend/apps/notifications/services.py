"""Notification service helpers."""
from django.conf import settings
from django.core.mail import send_mail

from .models import NotificationLog, NotificationSetting


def get_notification_settings():
    """Return DB settings if present, otherwise env defaults."""
    db_settings = NotificationSetting.objects.order_by('-created_at').first()
    if db_settings:
        return {
            'email_enabled': db_settings.email_enabled,
            'sms_enabled': db_settings.sms_enabled,
            'from_email': db_settings.from_email or settings.DEFAULT_FROM_EMAIL,
            'sms_provider': db_settings.sms_provider or settings.NOTIFICATIONS_SMS_PROVIDER,
        }
    return {
        'email_enabled': settings.NOTIFICATIONS_EMAIL_ENABLED,
        'sms_enabled': settings.NOTIFICATIONS_SMS_ENABLED,
        'from_email': settings.NOTIFICATIONS_FROM_EMAIL,
        'sms_provider': settings.NOTIFICATIONS_SMS_PROVIDER,
    }


def send_email_notification(recipient_email, subject, message, from_email):
    """Send email using Django email backend."""
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=[recipient_email],
            fail_silently=False
        )
        return True, ''
    except Exception as exc:
        return False, str(exc)


def send_sms_notification(recipient_phone, message, provider):
    """Placeholder for SMS sending. Integrate provider later."""
    if provider == 'twilio':
        if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN or not settings.TWILIO_PHONE_NUMBER:
            return False, 'Twilio settings missing'
        try:
            from twilio.rest import Client
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            client.messages.create(
                body=message,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=recipient_phone
            )
            return True, ''
        except Exception as exc:
            return False, str(exc)
    return False, 'SMS provider not configured'


def log_and_send(
    channel,
    recipient_email,
    recipient_phone,
    subject,
    message,
    created_by=None,
    created_by_id=None,
    metadata=None
):
    """Create a log entry and send notification."""
    settings_data = get_notification_settings()
    email_enabled = settings_data['email_enabled']
    sms_enabled = settings_data['sms_enabled']
    from_email = settings_data['from_email']
    sms_provider = settings_data['sms_provider']

    metadata = metadata or {}
    log = NotificationLog.objects.create(
        channel=channel,
        recipient_email=recipient_email,
        recipient_phone=recipient_phone,
        subject=subject or '',
        message=message,
        created_by=created_by,
        created_by_id=created_by_id,
        metadata=metadata
    )

    if channel == NotificationLog.Channel.EMAIL and not email_enabled:
        log.status = NotificationLog.Status.SKIPPED
        log.error_message = 'Email notifications disabled'
        log.save(update_fields=['status', 'error_message'])
        return log
    if channel == NotificationLog.Channel.SMS and not sms_enabled:
        log.status = NotificationLog.Status.SKIPPED
        log.error_message = 'SMS notifications disabled'
        log.save(update_fields=['status', 'error_message'])
        return log

    if channel == NotificationLog.Channel.EMAIL:
        success, error = send_email_notification(recipient_email, subject, message, from_email)
    else:
        success, error = send_sms_notification(recipient_phone, message, sms_provider)

    if success:
        log.status = NotificationLog.Status.SENT
    else:
        log.status = NotificationLog.Status.FAILED
        log.error_message = error
    log.save(update_fields=['status', 'error_message'])
    return log


def send_warranty_confirmation(warranty):
    """Send warranty confirmation email/SMS when available."""
    subject = f'Warranty Confirmation - {warranty.warranty_number}'
    message_lines = [
        'Your warranty has been activated.',
        f'Warranty Number: {warranty.warranty_number}',
        f'Serial Number: {warranty.serial_number.serial_number}',
        f'Battery Model: {warranty.battery_model.name}',
        f'Start Date: {warranty.start_date.date()}',
    ]
    if warranty.end_date:
        message_lines.append(f'End Date: {warranty.end_date.date()}')
    message = '\n'.join(message_lines)

    logs = []
    if warranty.consumer and warranty.consumer.email:
        logs.append(
            log_and_send(
                NotificationLog.Channel.EMAIL,
                recipient_email=warranty.consumer.email,
                recipient_phone=None,
                subject=subject,
                message=message,
                created_by=warranty.issued_by,
                metadata={'warranty_id': warranty.id}
            )
        )

    if warranty.consumer and warranty.consumer.phone:
        logs.append(
            log_and_send(
                NotificationLog.Channel.SMS,
                recipient_email=None,
                recipient_phone=warranty.consumer.phone,
                subject='Warranty Activated',
                message=message,
                created_by=warranty.issued_by,
                metadata={'warranty_id': warranty.id}
            )
        )
    return logs
