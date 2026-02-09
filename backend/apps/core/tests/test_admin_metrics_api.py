import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.users.models import User


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
def test_admin_metrics(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    url = reverse('admin-metrics')
    response = api_client.get(url)
    assert response.status_code == 200
    assert 'users_by_role' in response.data
