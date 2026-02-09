"""Serializers for notification APIs."""
from rest_framework import serializers

from .models import NotificationLog


class NotificationLogSerializer(serializers.ModelSerializer):
    """Serializer for notification logs."""

    class Meta:
        model = NotificationLog
        fields = [
            'id', 'channel', 'status', 'recipient_email', 'recipient_phone',
            'subject', 'message', 'error_message', 'metadata', 'created_at', 'created_by'
        ]
        read_only_fields = ['created_at']


class SendNotificationSerializer(serializers.Serializer):
    """Serializer for sending notifications."""

    channel = serializers.ChoiceField(choices=NotificationLog.Channel.choices)
    recipient_email = serializers.EmailField(required=False)
    recipient_phone = serializers.CharField(required=False)
    subject = serializers.CharField(required=False, allow_blank=True)
    message = serializers.CharField()

    def validate(self, attrs):
        if attrs['channel'] == NotificationLog.Channel.EMAIL and not attrs.get('recipient_email'):
            raise serializers.ValidationError('recipient_email is required for email')
        if attrs['channel'] == NotificationLog.Channel.SMS and not attrs.get('recipient_phone'):
            raise serializers.ValidationError('recipient_phone is required for SMS')
        return attrs
