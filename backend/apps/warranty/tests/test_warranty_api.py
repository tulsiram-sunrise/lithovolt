import pytest
from django.urls import reverse
from django.test import override_settings
from rest_framework.test import APIClient

from apps.users.models import User
from apps.inventory.models import BatteryModel, SerialNumber
from apps.warranty.models import Warranty


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
def wholesaler_user(db):
    return User.objects.create_user(
        email='wholesaler@test.com',
        password='wholesalerpass123',
        first_name='Whole',
        role='WHOLESALER'
    )


@pytest.fixture()
def consumer_user(db):
    return User.objects.create_user(
        email='consumer@test.com',
        password='consumerpass123',
        first_name='Consumer',
        role='CONSUMER'
    )


@pytest.fixture()
def battery_model(db):
    return BatteryModel.objects.create(
        name='Lithovolt 12V 150Ah',
        sku='LV-12V-150',
        model_number='LV12-150',
        capacity_ah=150,
        voltage=12,
        warranty_months=18,
        description='Lead-acid battery',
        is_active=True
    )


@pytest.fixture()
def allocated_serial(db, battery_model, wholesaler_user):
    serial = SerialNumber.objects.create(
        battery_model=battery_model,
        serial_number='LV0000000001',
        status=SerialNumber.Status.ALLOCATED,
        allocated_to=wholesaler_user
    )
    return serial


@pytest.mark.django_db
def test_issue_warranty(api_client, wholesaler_user, allocated_serial, tmp_path):
    api_client.force_authenticate(user=wholesaler_user)
    url = reverse('warranty-issue')
    payload = {
        'serial_number': allocated_serial.serial_number,
        'consumer_phone': '+919999999999',
        'consumer_first_name': 'John',
        'consumer_last_name': 'Doe'
    }

    with override_settings(MEDIA_ROOT=tmp_path):
        response = api_client.post(url, payload, format='json')
    assert response.status_code == 201
    assert Warranty.objects.filter(serial_number=allocated_serial).exists()

    allocated_serial.refresh_from_db()
    assert allocated_serial.status == SerialNumber.Status.SOLD
    assert allocated_serial.sold_to is not None


@pytest.mark.django_db
def test_claim_warranty(api_client, battery_model, tmp_path):
    serial = SerialNumber.objects.create(
        battery_model=battery_model,
        serial_number='LV0000000002',
        status=SerialNumber.Status.AVAILABLE
    )

    url = reverse('warranty-claim')
    payload = {
        'serial_number': serial.serial_number,
        'consumer_phone': '+919888888888',
        'consumer_first_name': 'Jane'
    }

    with override_settings(MEDIA_ROOT=tmp_path):
        response = api_client.post(url, payload, format='json')
    assert response.status_code == 201
    warranty = Warranty.objects.get(serial_number=serial)
    assert warranty.consumer is not None


@pytest.mark.django_db
def test_verify_warranty(api_client, battery_model, wholesaler_user):
    serial = SerialNumber.objects.create(
        battery_model=battery_model,
        serial_number='LV0000000003',
        status=SerialNumber.Status.SOLD,
        sold_to=wholesaler_user
    )
    warranty = Warranty.objects.create(serial_number=serial, consumer=wholesaler_user)

    url = reverse('warranty-verify', kwargs={'serial_number': serial.serial_number})
    response = api_client.get(url)

    assert response.status_code == 200
    assert response.data['warranty_number'] == warranty.warranty_number


@pytest.mark.django_db
def test_export_warranties_csv(api_client, admin_user, battery_model):
    api_client.force_authenticate(user=admin_user)
    serial = SerialNumber.objects.create(
        battery_model=battery_model,
        serial_number='LV0000000099',
        status=SerialNumber.Status.SOLD
    )
    Warranty.objects.create(serial_number=serial, consumer=admin_user)

    url = reverse('warranty-export')
    response = api_client.get(url)

    assert response.status_code == 200
    assert response['Content-Type'].startswith('text/csv')


@pytest.mark.django_db
def test_create_warranty_claim(api_client, consumer_user, battery_model):
    serial = SerialNumber.objects.create(
        battery_model=battery_model,
        serial_number='LV0000000200',
        status=SerialNumber.Status.SOLD,
        sold_to=consumer_user
    )
    warranty = Warranty.objects.create(serial_number=serial, consumer=consumer_user)

    api_client.force_authenticate(user=consumer_user)
    url = reverse('warranty-claim-list')
    response = api_client.post(
        url,
        {'warranty_number': warranty.warranty_number, 'description': 'Defect issue'},
        format='json'
    )

    assert response.status_code == 201
    assert response.data['status'] == 'PENDING'
