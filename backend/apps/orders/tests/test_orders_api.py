import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.users.models import User
from apps.inventory.models import BatteryModel, Accessory
from apps.orders.models import Order


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
def accessory(db):
    return Accessory.objects.create(
        name='Battery Terminal',
        sku='LV-ACC-01',
        description='Accessory',
        price=199.00,
        is_active=True
    )


@pytest.mark.django_db
def test_wholesaler_create_order(api_client, wholesaler_user, battery_model, accessory):
    api_client.force_authenticate(user=wholesaler_user)
    url = reverse('order-list')
    payload = {
        'notes': 'Need two items',
        'items': [
            {
                'product_type': 'BATTERY_MODEL',
                'battery_model_id': battery_model.id,
                'quantity': 1
            },
            {
                'product_type': 'ACCESSORY',
                'accessory_id': accessory.id,
                'quantity': 2
            }
        ]
    }

    response = api_client.post(url, payload, format='json')
    assert response.status_code == 201
    order = Order.objects.get(id=response.data['id'])
    assert order.consumer == wholesaler_user
    assert order.items.count() == 2


@pytest.mark.django_db
def test_admin_accept_order(api_client, admin_user, wholesaler_user, battery_model):
    order = Order.objects.create(consumer=wholesaler_user)
    order.items.create(product_type='BATTERY_MODEL', battery_model=battery_model, quantity=1)

    api_client.force_authenticate(user=admin_user)
    url = reverse('order-accept', kwargs={'pk': order.id})
    response = api_client.post(url, {}, format='json')

    assert response.status_code == 200
    order.refresh_from_db()
    assert order.status == Order.Status.ACCEPTED
    assert order.wholesaler is None


@pytest.mark.django_db
def test_export_orders_csv(api_client, admin_user, wholesaler_user):
    api_client.force_authenticate(user=admin_user)
    Order.objects.create(consumer=wholesaler_user)

    url = reverse('order-export')
    response = api_client.get(url)

    assert response.status_code == 200
    assert response['Content-Type'].startswith('text/csv')


@pytest.mark.django_db
def test_invoice_pdf(api_client, wholesaler_user, battery_model):
    order = Order.objects.create(consumer=wholesaler_user)
    order.items.create(product_type='BATTERY_MODEL', battery_model=battery_model, quantity=1)

    api_client.force_authenticate(user=wholesaler_user)
    url = reverse('order-invoice', kwargs={'pk': order.id})
    response = api_client.get(url)

    assert response.status_code == 200
    assert response['Content-Type'] == 'application/pdf'
