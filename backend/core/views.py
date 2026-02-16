"""Core API views."""
import logging
from datetime import datetime
from django.http import HttpResponseRedirect
from django.views import View
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from core.permissions import IsAdmin
from apps.users.models import User
from apps.inventory.models import BatteryModel, SerialNumber
from apps.orders.models import Order
from apps.warranty.models import Warranty
from apps.notifications.models import NotificationLog


# Initialize logger
logger = logging.getLogger(__name__)


class AppDownloadRedirectView(View):
    """
    Smart download redirect endpoint that detects device type and redirects to appropriate store.
    
    URL: /download/
    
    Device Detection Logic:
    - Android devices are redirected to Google Play Store
    - iOS devices (iPhone/iPad) are redirected to Apple App Store
    - All other devices (desktop/unknown) are redirected to a fallback landing page
    
    Configuration (via Django settings):
    - ANDROID_APP_URL: URL to Google Play Store or equivalent
    - IOS_APP_URL: URL to Apple App Store or equivalent
    - WEB_LANDING_URL: Fallback URL for web/desktop users
    """

    def get(self, request):
        """
        Handle GET request and redirect based on device type.
        
        Args:
            request: Django HttpRequest object
            
        Returns:
            HttpResponseRedirect: Redirect to appropriate store URL
        """
        # Extract user agent from request headers
        user_agent = request.META.get('HTTP_USER_AGENT', '').lower()
        
        # Get timestamp for logging
        timestamp = datetime.now().isoformat()
        
        # Detect device type and determine redirect URL
        device_type = self._detect_device_type(user_agent)
        redirect_url = self._get_redirect_url(device_type)
        
        # Log the device detection and access
        logger.info(
            f"Download redirect - Device: {device_type} | "
            f"URL: {redirect_url} | "
            f"Timestamp: {timestamp} | "
            f"User-Agent: {user_agent}"
        )
        
        # Return redirect response
        return HttpResponseRedirect(redirect_url)
    
    def _detect_device_type(self, user_agent):
        """
        Detect device type from user agent string.
        
        Args:
            user_agent (str): HTTP User-Agent header value (lowercase)
            
        Returns:
            str: One of 'android', 'ios', or 'web'
        """
        # Check for Android
        if 'android' in user_agent:
            return 'android'
        
        # Check for iOS (iPhone or iPad)
        if 'iphone' in user_agent or 'ipad' in user_agent:
            return 'ios'
        
        # Default to web for all other cases (desktop, unknown, etc.)
        return 'web'
    
    def _get_redirect_url(self, device_type):
        """
        Get the redirect URL based on device type from Django settings.
        
        Args:
            device_type (str): Device type ('android', 'ios', or 'web')
            
        Returns:
            str: Appropriate redirect URL from settings
        """
        if device_type == 'android':
            return getattr(
                settings,
                'ANDROID_APP_URL',
                'https://play.google.com/store/apps/details?id=au.com.lithovolt'
            )
        elif device_type == 'ios':
            return getattr(
                settings,
                'IOS_APP_URL',
                'https://apps.apple.com/app/lithovolt/id1234567890'
            )
        else:  # web
            return getattr(
                settings,
                'WEB_LANDING_URL',
                'https://www.lithovolt.com.au'
            )


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
