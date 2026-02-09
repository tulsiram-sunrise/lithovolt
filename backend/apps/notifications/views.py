"""Notification API views."""
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from core.permissions import IsAdmin
from .models import NotificationLog
from .serializers import NotificationLogSerializer, SendNotificationSerializer
from .services import log_and_send
from .tasks import send_notification_task


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """List notification logs and send manual notifications (admin)."""

    queryset = NotificationLog.objects.all()
    serializer_class = NotificationLogSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['channel', 'status']
    search_fields = ['recipient_email', 'recipient_phone', 'subject']
    ordering_fields = ['created_at']

    @action(detail=False, methods=['post'])
    def send(self, request):
        serializer = SendNotificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        channel = serializer.validated_data['channel']
        recipient_email = serializer.validated_data.get('recipient_email')
        recipient_phone = serializer.validated_data.get('recipient_phone')
        subject = serializer.validated_data.get('subject', '')
        message = serializer.validated_data['message']

        if getattr(settings, 'ASYNC_TASKS_ENABLED', False):
            task = send_notification_task.delay(
                channel=channel,
                recipient_email=recipient_email,
                recipient_phone=recipient_phone,
                subject=subject,
                message=message,
                created_by_id=request.user.id
            )
            return Response({'task_id': task.id}, status=status.HTTP_202_ACCEPTED)

        log = log_and_send(
            channel=channel,
            recipient_email=recipient_email,
            recipient_phone=recipient_phone,
            subject=subject,
            message=message,
            created_by=request.user
        )

        return Response(NotificationLogSerializer(log).data, status=status.HTTP_201_CREATED)
