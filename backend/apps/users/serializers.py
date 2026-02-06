"""
Serializers for User models.
"""
from rest_framework import serializers
from .models import User, UserProfile


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
        
        # Create profile
        UserProfile.objects.create(user=user)
        
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""
    
    class Meta:
        model = User
        fields = [
            'phone', 'first_name', 'last_name', 'company_name', 'gst_number',
            'address', 'city', 'state', 'pincode'
        ]


class WholesalerListSerializer(serializers.ModelSerializer):
    """Minimal serializer for wholesaler list."""
    
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'company_name', 'phone', 'city', 'is_active']
