"""
Serializers for User models.
"""
from rest_framework import serializers
from core.utils import format_phone_number
from .models import User, UserProfile, WholesalerApplication


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model."""
    
    class Meta:
        model = UserProfile
        fields = [
            'business_license', 'credit_limit', 'outstanding_balance',
            'notification_email', 'notification_sms', 'notification_push'
        ]
        read_only_fields = ['credit_limit', 'outstanding_balance']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    
    profile = UserProfileSerializer(read_only=True)
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'phone', 'first_name', 'last_name', 'full_name',
            'role', 'is_active', 'is_verified', 'company_name', 'gst_number',
            'address', 'city', 'state', 'pincode', 'profile', 'created_at'
        ]
        read_only_fields = ['id', 'role', 'is_verified', 'created_at']


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating users (Admin only)."""
    
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = [
            'email', 'password', 'phone', 'first_name', 'last_name', 'role',
            'company_name', 'gst_number', 'address', 'city', 'state', 'pincode'
        ]
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()

        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""
    
    class Meta:
        model = User
        fields = [
            'email', 'phone', 'first_name', 'last_name', 'company_name', 'gst_number',
            'address', 'city', 'state', 'pincode'
        ]

    def validate_phone(self, value):
        if value:
            return format_phone_number(value)
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email=value).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError('Email is already in use')
        return value


class WholesalerListSerializer(serializers.ModelSerializer):
    """Minimal serializer for wholesaler list."""
    
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'company_name', 'phone', 'city', 'is_active']


class WholesalerApplicationSerializer(serializers.ModelSerializer):
    """Read serializer for wholesaler applications."""

    user_email = serializers.EmailField(source='user.email', read_only=True)
    reviewer_email = serializers.EmailField(source='reviewed_by.email', read_only=True)

    class Meta:
        model = WholesalerApplication
        fields = [
            'id', 'user', 'user_email', 'business_name', 'registration_number',
            'address', 'city', 'state', 'pincode', 'contact_phone', 'contact_email',
            'document', 'status', 'review_notes', 'reviewed_by', 'reviewer_email',
            'reviewed_at', 'created_at'
        ]
        read_only_fields = ['status', 'reviewed_by', 'reviewed_at', 'created_at']


class WholesalerApplicationCreateSerializer(serializers.ModelSerializer):
    """Create serializer for wholesaler applications."""

    class Meta:
        model = WholesalerApplication
        fields = [
            'business_name', 'registration_number', 'address', 'city', 'state',
            'pincode', 'contact_phone', 'contact_email', 'document'
        ]

    def validate(self, attrs):
        user = self.context['request'].user
        if user.role != 'CONSUMER':
            raise serializers.ValidationError('Only consumers can apply to become wholesalers')
        if WholesalerApplication.objects.filter(user=user, status=WholesalerApplication.Status.PENDING).exists():
            raise serializers.ValidationError('You already have a pending application')
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        return WholesalerApplication.objects.create(user=user, **validated_data)
