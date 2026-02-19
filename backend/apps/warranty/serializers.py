"""Serializers for warranty APIs."""
from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Warranty, WarrantyClaim, WarrantyClaimAttachment
from apps.inventory.models import SerialNumber
from core.utils import format_phone_number

User = get_user_model()


class WarrantySerializer(serializers.ModelSerializer):
    """Serializer for warranty records."""

    serial = serializers.CharField(source='serial_number.serial_number', read_only=True)
    battery_model_name = serializers.CharField(source='serial_number.battery_model.name', read_only=True)
    battery_model_sku = serializers.CharField(source='serial_number.battery_model.sku', read_only=True)
    consumer_name = serializers.CharField(source='consumer.get_full_name', read_only=True)

    class Meta:
        model = Warranty
        fields = [
            'id', 'warranty_number', 'serial', 'battery_model_name', 'battery_model_sku',
            'consumer', 'consumer_name', 'issued_by', 'issued_at',
            'start_date', 'end_date', 'status', 'certificate_file', 'qr_code_image',
            'notes', 'created_at'
        ]
        read_only_fields = [
            'warranty_number', 'issued_at', 'start_date', 'end_date',
            'status', 'certificate_file', 'qr_code_image', 'created_at'
        ]


class WarrantyIssueSerializer(serializers.Serializer):
    """Issue warranty during sale by admin/wholesaler."""

    serial_number = serializers.CharField(max_length=50)
    consumer_email = serializers.EmailField(required=False)
    consumer_phone = serializers.CharField(required=False)
    consumer_first_name = serializers.CharField(required=False, allow_blank=True)
    consumer_last_name = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if not attrs.get('consumer_email') and not attrs.get('consumer_phone'):
            raise serializers.ValidationError('Consumer email or phone is required')
        if attrs.get('consumer_phone'):
            attrs['consumer_phone'] = format_phone_number(attrs['consumer_phone'])
        if attrs.get('consumer_email'):
            attrs['consumer_email'] = attrs['consumer_email'].strip().lower()
        return attrs


class WarrantyClaimSerializer(serializers.Serializer):
    """Consumer claim/activation by serial or QR."""

    serial_number = serializers.CharField(max_length=50)
    consumer_email = serializers.EmailField(required=False)
    consumer_phone = serializers.CharField(required=False)
    consumer_first_name = serializers.CharField(required=False, allow_blank=True)
    consumer_last_name = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if not attrs.get('consumer_email') and not attrs.get('consumer_phone'):
            raise serializers.ValidationError('Consumer email or phone is required')
        if attrs.get('consumer_phone'):
            attrs['consumer_phone'] = format_phone_number(attrs['consumer_phone'])
        if attrs.get('consumer_email'):
            attrs['consumer_email'] = attrs['consumer_email'].strip().lower()
        return attrs


class WarrantyPublicSerializer(serializers.ModelSerializer):
    """Public verification response serializer."""

    serial = serializers.CharField(source='serial_number.serial_number', read_only=True)
    battery_model_name = serializers.CharField(source='serial_number.battery_model.name', read_only=True)
    battery_model_sku = serializers.CharField(source='serial_number.battery_model.sku', read_only=True)
    consumer_name = serializers.CharField(source='consumer.get_full_name', read_only=True)

    class Meta:
        model = Warranty
        fields = [
            'warranty_number', 'serial', 'battery_model_name', 'battery_model_sku',
            'consumer_name', 'start_date', 'end_date', 'status'
        ]


class WarrantyClaimModelSerializer(serializers.ModelSerializer):
    """Serializer for claim model (future workflow)."""

    class Meta:
        model = WarrantyClaim
        fields = ['id', 'warranty', 'consumer', 'description', 'status', 'created_at']
        read_only_fields = ['created_at']


class WarrantyClaimCreateSerializer(serializers.Serializer):
    """Create serializer for warranty claims."""

    warranty_number = serializers.CharField(required=False)
    serial_number = serializers.CharField(required=False)
    description = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if not attrs.get('warranty_number') and not attrs.get('serial_number'):
            raise serializers.ValidationError('warranty_number or serial_number is required')
        return attrs


class WarrantyClaimDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for warranty claims with workflow."""

    attachments = serializers.SerializerMethodField()
    warranty_number = serializers.CharField(source='warranty.warranty_number', read_only=True)
    serial_number = serializers.CharField(source='warranty.serial_number.serial_number', read_only=True)
    consumer_name = serializers.CharField(source='consumer.get_full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True, allow_null=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True, allow_null=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    status_history = serializers.SerializerMethodField()

    def get_attachments(self, obj):
        request = self.context.get('request')
        items = []
        for attachment in obj.attachments.all():
            file_url = attachment.file.url if attachment.file else ''
            if request and file_url:
                file_url = request.build_absolute_uri(file_url)
            items.append({
                'id': attachment.id,
                'file': file_url,
                'created_at': attachment.created_at,
            })
        return items
    
    def get_status_history(self, obj):
        """Get all status transitions for this claim."""
        from .models import ClaimStatusHistory
        history = ClaimStatusHistory.objects.filter(claim=obj).values(
            'id', 'from_status', 'to_status', 'changed_by__first_name', 'changed_by__last_name',
            'notes', 'created_at'
        ).order_by('-created_at')
        return list(history)

    class Meta:
        model = WarrantyClaim
        fields = [
            'id', 'warranty', 'warranty_number', 'serial_number', 'consumer',
            'consumer_name', 'description', 'status', 'status_display', 'assigned_to',
            'assigned_to_name', 'reviewed_by', 'reviewed_by_name', 'review_notes',
            'resolution_date', 'status_history', 'created_at', 'attachments'
        ]
        read_only_fields = ['created_at', 'assigned_to', 'reviewed_by', 'review_notes', 'resolution_date', 'status_history']


class WarrantySerialLookupSerializer(serializers.Serializer):
    """Validate serial number existence."""

    serial_number = serializers.CharField(max_length=50)

    def validate_serial_number(self, value):
        if not SerialNumber.objects.filter(serial_number=value).exists():
            raise serializers.ValidationError('Serial number not found')
        return value
