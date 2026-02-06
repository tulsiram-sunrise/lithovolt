"""Authentication serializers."""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer with user details."""
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add custom user data
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'role': self.user.role,
            'first_name': self.user.first_name,
            'is_verified': self.user.is_verified
        }
        
        return data


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ['email', 'phone', 'first_name', 'last_name', 'password', 'password_confirm']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords don't match"})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        validated_data['role'] = 'CONSUMER'  # Default role for registration
        
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        return user


class OTPSendSerializer(serializers.Serializer):
    """Serializer for sending OTP."""
    
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False)
    otp_type = serializers.ChoiceField(choices=['LOGIN', 'VERIFICATION', 'PASSWORD_RESET'], default='LOGIN')
    
    def validate(self, attrs):
        if not attrs.get('email') and not attrs.get('phone'):
            raise serializers.ValidationError("Either email or phone is required")
        return attrs


class OTPVerifySerializer(serializers.Serializer):
    """Serializer for verifying OTP."""
    
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False)
    otp_code = serializers.CharField(required=True, max_length=6)
    
    def validate(self, attrs):
        if not attrs.get('email') and not attrs.get('phone'):
            raise serializers.ValidationError("Either email or phone is required")
        return attrs


class PasswordResetSerializer(serializers.Serializer):
    """Serializer for password reset."""
    
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for confirming password reset."""
    
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    new_password_confirm = serializers.CharField(write_only=True, style={'input_type': 'password'})
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"password": "Passwords don't match"})
        return attrs
