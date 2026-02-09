import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.users.models import User
from apps.inventory.models import BatteryModel, SerialNumber, StockAllocation


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


@pytest.mark.django_db
def test_create_battery_model(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    url = reverse('battery-model-list')
    payload = {
        'name': 'Lithovolt 12V 150Ah',
        'sku': 'LV-12V-150',
        'model_number': 'LV12-150',
        'capacity_ah': 150,
        'voltage': 12,
        'warranty_months': 18,
        'description': 'Lead-acid battery',
        'is_active': True
    }

    response = api_client.post(url, payload, format='json')
    assert response.status_code == 201
    assert BatteryModel.objects.filter(sku='LV-12V-150').exists()


@pytest.mark.django_db
def test_generate_serials(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    model = BatteryModel.objects.create(
        name='Lithovolt 12V 100Ah',
        sku='LV-12V-100',
        model_number='LV12-100',
        capacity_ah=100,
        voltage=12,
        warranty_months=18,
        description='Lead-acid battery',
        is_active=True
    )

    url = reverse('serial-number-generate')
    response = api_client.post(
        url,
        {'battery_model_id': model.id, 'quantity': 3, 'prefix': 'LV'},
        format='json'
    )
    assert response.status_code == 201
    assert SerialNumber.objects.filter(battery_model=model).count() == 3


@pytest.mark.django_db
def test_allocate_stock(api_client, admin_user, wholesaler_user):
    api_client.force_authenticate(user=admin_user)
    model = BatteryModel.objects.create(
        name='Lithovolt 12V 120Ah',
        sku='LV-12V-120',
        model_number='LV12-120',
        capacity_ah=120,
        voltage=12,
        warranty_months=18,
        description='Lead-acid battery',
        is_active=True
    )

    SerialNumber.create_batch(model, 5)

    url = reverse('stock-allocation-list')
    response = api_client.post(
        url,
        {
            'battery_model_id': model.id,
            'wholesaler_id': wholesaler_user.id,
            'quantity': 3,
            'notes': 'Initial allocation'
        },
        format='json'
    )
    assert response.status_code == 201
    assert StockAllocation.objects.filter(battery_model=model, wholesaler=wholesaler_user).exists()
    assert SerialNumber.objects.filter(
        battery_model=model,
        status=SerialNumber.Status.ALLOCATED,
        allocated_to=wholesaler_user
    ).count() == 3


@pytest.mark.django_db
def test_low_stock(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    model = BatteryModel.objects.create(
        name='Lithovolt 12V 80Ah',
        sku='LV-12V-080',
        model_number='LV12-080',
        capacity_ah=80,
        voltage=12,
        warranty_months=12,
        low_stock_threshold=2,
        description='Lead-acid battery',
        is_active=True
    )
    SerialNumber.create_batch(model, 2)

    url = reverse('battery-model-low-stock')
    response = api_client.get(url)

    assert response.status_code == 200
    assert len(response.data) == 1
