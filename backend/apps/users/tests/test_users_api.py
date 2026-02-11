import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.users.models import User, WholesalerApplication


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


@pytest.fixture()
def consumer_user(db):
    return User.objects.create_user(
        email='consumer@test.com',
        password='consumerpass123',
        first_name='Consumer',
        role='CONSUMER'
    )


@pytest.mark.django_db
def test_admin_list_users(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    url = reverse('user-list')
    response = api_client.get(url)
    assert response.status_code == 200


@pytest.mark.django_db
def test_admin_create_wholesaler(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    url = reverse('user-list')
    payload = {
        'email': 'newwholesaler@test.com',
        'password': 'Whole@123',
        'first_name': 'Whole',
        'last_name': 'Seller',
        'role': 'WHOLESALER',
        'company_name': 'Lithovolt Distributors'
    }

    response = api_client.post(url, payload, format='json')
    assert response.status_code == 201
    assert User.objects.filter(email='newwholesaler@test.com', role='WHOLESALER').exists()


@pytest.mark.django_db
def test_consumer_update_profile(api_client, consumer_user):
    api_client.force_authenticate(user=consumer_user)
    url = reverse('user-update-profile')
    payload = {'phone': '+919777777777', 'city': 'Delhi'}

    response = api_client.patch(url, payload, format='json')
    assert response.status_code == 200
    consumer_user.refresh_from_db()
    assert consumer_user.city == 'Delhi'


@pytest.mark.django_db
def test_consumer_submit_wholesaler_application(api_client, consumer_user):
    api_client.force_authenticate(user=consumer_user)
    url = reverse('wholesaler-application-list')
    payload = {
        'business_name': 'Demo Wholesales',
        'registration_number': 'GST-1234',
        'address': '123 Market Road',
        'city': 'Delhi',
        'state': 'Delhi',
        'pincode': '110001',
        'contact_phone': '+919999888777',
        'contact_email': 'demo@wholesale.com'
    }

    response = api_client.post(url, payload, format='multipart')
    assert response.status_code == 201
    assert WholesalerApplication.objects.filter(user=consumer_user).exists()


@pytest.mark.django_db
def test_wholesaler_application_requires_consumer(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    url = reverse('wholesaler-application-list')
    payload = {
        'business_name': 'Admin Wholesale',
        'registration_number': 'GST-ADMIN',
        'address': '123 Admin Road',
        'city': 'Delhi',
        'state': 'Delhi',
        'pincode': '110001'
    }

    response = api_client.post(url, payload, format='multipart')
    assert response.status_code == 400


@pytest.mark.django_db
def test_admin_approves_wholesaler_application(api_client, admin_user, consumer_user):
    application = WholesalerApplication.objects.create(
        user=consumer_user,
        business_name='Demo Wholesales',
        registration_number='GST-1234',
        address='123 Market Road',
        city='Delhi',
        state='Delhi',
        pincode='110001'
    )

    api_client.force_authenticate(user=admin_user)
    url = reverse('wholesaler-application-approve', kwargs={'pk': application.id})
    response = api_client.post(url, {'review_notes': 'Approved'}, format='json')

    assert response.status_code == 200
    application.refresh_from_db()
    assert application.status == WholesalerApplication.Status.APPROVED
    consumer_user.refresh_from_db()
    assert consumer_user.role == 'WHOLESALER'
