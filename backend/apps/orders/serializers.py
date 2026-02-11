"""Serializers for order APIs."""
from rest_framework import serializers
from .models import Order, OrderItem
from apps.inventory.models import BatteryModel, Accessory


class OrderItemSerializer(serializers.ModelSerializer):
    """Read serializer for order items."""

    battery_model_name = serializers.CharField(source='battery_model.name', read_only=True)
    accessory_name = serializers.CharField(source='accessory.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id', 'product_type', 'battery_model', 'battery_model_name',
            'accessory', 'accessory_name', 'quantity', 'unit_price', 'created_at'
        ]
        read_only_fields = ['created_at']


class OrderSerializer(serializers.ModelSerializer):
    """Read serializer for orders."""

    items = OrderItemSerializer(many=True, read_only=True)
    consumer_name = serializers.CharField(source='consumer.get_full_name', read_only=True)
    consumer_email = serializers.EmailField(source='consumer.email', read_only=True)
    consumer_phone = serializers.CharField(source='consumer.phone', read_only=True)
    consumer_first_name = serializers.CharField(source='consumer.first_name', read_only=True)
    consumer_last_name = serializers.CharField(source='consumer.last_name', read_only=True)
    wholesaler_name = serializers.CharField(source='wholesaler.get_full_name', read_only=True)
    total_items = serializers.IntegerField(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'consumer', 'consumer_name', 'consumer_email', 'consumer_phone',
            'consumer_first_name', 'consumer_last_name', 'wholesaler', 'wholesaler_name',
            'status', 'notes', 'accepted_at', 'fulfilled_at',
            'total_items', 'items', 'created_at'
        ]
        read_only_fields = ['accepted_at', 'fulfilled_at', 'created_at']


class OrderItemCreateSerializer(serializers.Serializer):
    """Create serializer for order items."""

    product_type = serializers.ChoiceField(choices=OrderItem.ProductType.choices)
    battery_model_id = serializers.IntegerField(required=False)
    accessory_id = serializers.IntegerField(required=False)
    quantity = serializers.IntegerField(min_value=1)

    def validate(self, attrs):
        product_type = attrs['product_type']
        battery_model_id = attrs.get('battery_model_id')
        accessory_id = attrs.get('accessory_id')

        if product_type == OrderItem.ProductType.BATTERY_MODEL:
            if not battery_model_id:
                raise serializers.ValidationError('battery_model_id is required')
            if not BatteryModel.objects.filter(id=battery_model_id, is_active=True).exists():
                raise serializers.ValidationError('Battery model not found')
        if product_type == OrderItem.ProductType.ACCESSORY:
            if not accessory_id:
                raise serializers.ValidationError('accessory_id is required')
            if not Accessory.objects.filter(id=accessory_id, is_active=True).exists():
                raise serializers.ValidationError('Accessory not found')
        return attrs


class OrderCreateSerializer(serializers.Serializer):
    """Create serializer for orders."""

    notes = serializers.CharField(required=False, allow_blank=True)
    items = OrderItemCreateSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('At least one item is required')
        return value
