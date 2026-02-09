import pytest
from django.urls import reverse
from django.test import override_settings
from rest_framework.test import APIClient

from apps.users.models import User
from apps.notifications.models import NotificationLog


@pytest.fixture()
def api_client():
    return APIClient()


@pytest.fixture()
def admin_user(db):
    return User.objects.create_superuser(
        email='admin@test.com',
        password='adminpass123',
        first_name='Admin'
    )


@pytest.mark.django_db
@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
def test_send_email_notification(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    url = reverse('notification-send')
    payload = {
        'channel': 'EMAIL',
        'recipient_email': 'customer@test.com',
        'subject': 'Test Email',
        'message': 'Hello from Lithovolt'
    }

    response = api_client.post(url, payload, format='json')
    assert response.status_code == 201
    assert NotificationLog.objects.filter(channel='EMAIL').exists()
