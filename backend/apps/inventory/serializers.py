"""Serializers for inventory models."""
from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import BatteryModel, Accessory, SerialNumber, StockAllocation

User = get_user_model()


class BatteryModelSerializer(serializers.ModelSerializer):
    """Serializer for battery models."""

    total_stock = serializers.IntegerField(read_only=True)
    available_stock = serializers.IntegerField(read_only=True)
    allocated_stock = serializers.IntegerField(read_only=True)
    sold_stock = serializers.IntegerField(read_only=True)

    class Meta:
        model = BatteryModel
        fields = [
            'id', 'name', 'sku', 'model_number', 'capacity_ah', 'voltage',
            'warranty_months', 'low_stock_threshold', 'description', 'is_active',
            'total_stock', 'available_stock', 'allocated_stock', 'sold_stock',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class SerialNumberSerializer(serializers.ModelSerializer):
    """Serializer for serial numbers."""

    battery_model_name = serializers.CharField(source='battery_model.name', read_only=True)
    battery_model_sku = serializers.CharField(source='battery_model.sku', read_only=True)

    class Meta:
        model = SerialNumber
        fields = [
            'id', 'battery_model', 'battery_model_name', 'battery_model_sku',
            'serial_number', 'status', 'allocated_to', 'allocated_at',
            'sold_to', 'sold_at', 'created_at'
        ]
        read_only_fields = ['serial_number', 'status', 'allocated_at', 'sold_at', 'created_at']


class AccessorySerializer(serializers.ModelSerializer):
    """Serializer for accessory catalog."""

    class Meta:
        model = Accessory
        fields = ['id', 'name', 'sku', 'description', 'price', 'is_active', 'created_at']
        read_only_fields = ['created_at']


class SerialBatchCreateSerializer(serializers.Serializer):
    """Serializer for generating serial number batches."""

    battery_model_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, max_value=10000)
    prefix = serializers.CharField(max_length=10, required=False, default='LV')

    def validate_battery_model_id(self, value):
        if not BatteryModel.objects.filter(id=value).exists():
            raise serializers.ValidationError('Battery model not found')
        return value


class StockAllocationSerializer(serializers.ModelSerializer):
    """Serializer for stock allocations."""

    battery_model_name = serializers.CharField(source='battery_model.name', read_only=True)
    wholesaler_email = serializers.EmailField(source='wholesaler.email', read_only=True)

    class Meta:
        model = StockAllocation
        fields = [
            'id', 'battery_model', 'battery_model_name', 'wholesaler',
            'wholesaler_email', 'allocated_by', 'quantity', 'notes', 'created_at'
        ]
        read_only_fields = ['allocated_by', 'created_at']


class StockAllocationCreateSerializer(serializers.Serializer):
    """Serializer for allocating stock to wholesalers."""

    battery_model_id = serializers.IntegerField()
    wholesaler_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_battery_model_id(self, value):
        if not BatteryModel.objects.filter(id=value).exists():
            raise serializers.ValidationError('Battery model not found')
        return value

    def validate_wholesaler_id(self, value):
        if not User.objects.filter(id=value, role='WHOLESALER', is_active=True).exists():
            raise serializers.ValidationError('Wholesaler not found or inactive')
        return value
