"""Core API views."""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from core.permissions import IsAdmin
from apps.users.models import User
from apps.inventory.models import BatteryModel, SerialNumber
from apps.orders.models import Order
from apps.warranty.models import Warranty
from apps.notifications.models import NotificationLog


class AdminMetricsView(APIView):
    """Admin metrics for dashboard."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        users_by_role = {
            'ADMIN': User.objects.filter(role='ADMIN').count(),
            'WHOLESALER': User.objects.filter(role='WHOLESALER').count(),
            'CONSUMER': User.objects.filter(role='CONSUMER').count(),
        }

        serials_by_status = {
            'AVAILABLE': SerialNumber.objects.filter(status=SerialNumber.Status.AVAILABLE).count(),
            'ALLOCATED': SerialNumber.objects.filter(status=SerialNumber.Status.ALLOCATED).count(),
            'SOLD': SerialNumber.objects.filter(status=SerialNumber.Status.SOLD).count(),
        }

        orders_by_status = {
            status: Order.objects.filter(status=status).count()
            for status, _ in Order.Status.choices
        }

        warranties_by_status = {
            status: Warranty.objects.filter(status=status).count()
            for status, _ in Warranty.Status.choices
        }

        notifications_by_status = {
            status: NotificationLog.objects.filter(status=status).count()
            for status, _ in NotificationLog.Status.choices
        }

        data = {
            'users_by_role': users_by_role,
            'battery_models': BatteryModel.objects.count(),
            'serials_by_status': serials_by_status,
            'orders_by_status': orders_by_status,
            'warranties_by_status': warranties_by_status,
            'notifications_by_status': notifications_by_status,
        }
        return Response(data)
