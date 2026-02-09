import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.users.models import User
from apps.authentication.models import OTP


@pytest.fixture()
def api_client():
    return APIClient()


@pytest.mark.django_db
def test_register_and_login(api_client):
    register_url = reverse('register')
    payload = {
        'email': 'newuser@test.com',
        'phone': '+919999999999',
        'first_name': 'New',
        'last_name': 'User',
        'password': 'Test@1234',
        'password_confirm': 'Test@1234'
    }

    response = api_client.post(register_url, payload, format='json')
    assert response.status_code == 201
    assert User.objects.filter(email='newuser@test.com').exists()

    login_url = reverse('token_obtain_pair')
    login_payload = {'email': 'newuser@test.com', 'password': 'Test@1234'}
    response = api_client.post(login_url, login_payload, format='json')
    assert response.status_code == 200
    assert 'access' in response.data


@pytest.mark.django_db
def test_otp_login(api_client):
    User.objects.create_user(
        phone='+919888888888',
        first_name='Otp',
        role='CONSUMER'
    )

    send_url = reverse('send_otp')
    response = api_client.post(send_url, {'phone': '+919888888888'}, format='json')
    assert response.status_code == 200

    otp = OTP.objects.filter(user__phone='+919888888888', is_used=False).first()
    assert otp is not None

    verify_url = reverse('verify_otp')
    response = api_client.post(
        verify_url,
        {'phone': '+919888888888', 'otp_code': otp.otp_code},
        format='json'
    )
    assert response.status_code == 200
    assert 'access' in response.data


@pytest.mark.django_db
def test_password_reset(api_client):
    user = User.objects.create_user(
        email='reset@test.com',
        password='OldPass@123',
        first_name='Reset',
        role='CONSUMER'
    )

    request_url = reverse('password_reset')
    response = api_client.post(request_url, {'email': 'reset@test.com'}, format='json')
    assert response.status_code == 200

    otp = OTP.objects.filter(user=user, otp_type='PASSWORD_RESET', is_used=False).first()
    assert otp is not None

    confirm_url = reverse('password_reset_confirm')
    payload = {
        'email': 'reset@test.com',
        'otp_code': otp.otp_code,
        'new_password': 'NewPass@123',
        'new_password_confirm': 'NewPass@123'
    }
    response = api_client.post(confirm_url, payload, format='json')
    assert response.status_code == 200
