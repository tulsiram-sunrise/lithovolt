"""
Signals for warranty app to handle notifications on claim status changes.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from apps.notifications.models import NotificationLog
from .models import WarrantyClaim


@receiver(post_save, sender=WarrantyClaim)
def notify_on_claim_status_change(sender, instance, created, **kwargs):
    """
    Send notification when warranty claim status changes.
    Notifies consumer and assigned staff member based on status.
    """
    # Don't notify on initial creation (status is PENDING)
    if created:
        return
    
    # Determine notification type based on new status
    status_notifications = {
        WarrantyClaim.Status.UNDER_REVIEW: {
            'consumer_title': 'Claim Under Review',
            'consumer_msg': f'Your warranty claim {instance.id} is now under review by our team.',
            'staff_title': 'New Claim for Review',
            'staff_msg': f'Warranty claim {instance.id} has been assigned to you for review.'
        },
        WarrantyClaim.Status.APPROVED: {
            'consumer_title': 'Claim Approved',
            'consumer_msg': f'Your warranty claim {instance.id} has been approved. Our team will contact you soon.',
            'staff_title': 'Claim Approved',
            'staff_msg': f'Claim {instance.id} is now approved.'
        },
        WarrantyClaim.Status.REJECTED: {
            'consumer_title': 'Claim Rejected',
            'consumer_msg': f'Your warranty claim {instance.id} has been rejected. Reason: {instance.review_notes}',
            'staff_title': 'Claim Rejected',
            'staff_msg': f'Claim {instance.id} is now rejected.'
        },
        WarrantyClaim.Status.RESOLVED: {
            'consumer_title': 'Claim Resolved',
            'consumer_msg': f'Your warranty claim {instance.id} has been resolved.',
            'staff_title': 'Claim Resolved',
            'staff_msg': f'Claim {instance.id} is now resolved.'
        }
    }
    
    notification_data = status_notifications.get(instance.status)
    if not notification_data:
        return
    
    # Notify consumer via email and in-app
    NotificationLog.objects.create(
        recipient=instance.consumer,
        title=notification_data['consumer_title'],
        message=notification_data['consumer_msg'],
        channel=NotificationLog.Channel.EMAIL,
        entity_type='warranty_claim',
        entity_id=instance.id,
        status=NotificationLog.Status.PENDING
    )
    
    NotificationLog.objects.create(
        recipient=instance.consumer,
        title=notification_data['consumer_title'],
        message=notification_data['consumer_msg'],
        channel=NotificationLog.Channel.IN_APP,
        entity_type='warranty_claim',
        entity_id=instance.id,
        status=NotificationLog.Status.PENDING
    )
    
    # Notify assigned staff member
    if instance.assigned_to:
        NotificationLog.objects.create(
            recipient=instance.assigned_to,
            title=notification_data['staff_title'],
            message=notification_data['staff_msg'],
            channel=NotificationLog.Channel.IN_APP,
            entity_type='warranty_claim',
            entity_id=instance.id,
            status=NotificationLog.Status.PENDING
        )
    
    # Notify reviewer if different from assigned_to
    if instance.reviewed_by and instance.reviewed_by != instance.assigned_to:
        NotificationLog.objects.create(
            recipient=instance.reviewed_by,
            title=notification_data['staff_title'],
            message=notification_data['staff_msg'],
            channel=NotificationLog.Channel.IN_APP,
            entity_type='warranty_claim',
            entity_id=instance.id,
            status=NotificationLog.Status.PENDING
        )
