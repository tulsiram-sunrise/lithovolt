"""Authentication views."""
from django.conf import settings
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

from .serializers import (
    CustomTokenObtainPairSerializer, RegisterSerializer,
    OTPSendSerializer, OTPVerifySerializer,
    PasswordResetSerializer, PasswordResetConfirmSerializer
)
from .models import OTP
from core.utils import format_phone_number
from apps.notifications.models import NotificationLog
from apps.notifications.services import log_and_send
from apps.notifications.tasks import send_notification_task

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom JWT token view with user details."""
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """User registration endpoint."""
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    """Send OTP to email or phone."""
    serializer = OTPSendSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    email = serializer.validated_data.get('email')
    phone = serializer.validated_data.get('phone')
    otp_type = serializer.validated_data.get('otp_type', 'LOGIN')

    if email:
        email = email.strip().lower()
    if phone:
        phone = format_phone_number(phone)
    
    # Get or create user
    user = None
    if email:
        user, created = User.objects.get_or_create(
            email=email,
            defaults={'role': 'CONSUMER', 'first_name': email.split('@')[0]}
        )
    elif phone:
        user, created = User.objects.get_or_create(
            phone=phone,
            defaults={'role': 'CONSUMER', 'first_name': f'User{phone[-4:]}'}
        )
    
    # Create OTP
    otp = OTP.create_otp(user, otp_type)
    
    message = f'Your OTP code is {otp.otp_code}. It expires in 10 minutes.'
    if email:
        if getattr(settings, 'ASYNC_TASKS_ENABLED', False):
            send_notification_task.delay(
                channel=NotificationLog.Channel.EMAIL,
                recipient_email=email,
                recipient_phone=None,
                subject='OTP Code',
                message=message,
                created_by_id=request.user.id if request.user.is_authenticated else None,
                metadata={'otp_type': otp_type}
            )
        else:
            log_and_send(
                channel=NotificationLog.Channel.EMAIL,
                recipient_email=email,
                recipient_phone=None,
                subject='OTP Code',
                message=message,
                created_by=request.user if request.user.is_authenticated else None,
                metadata={'otp_type': otp_type}
            )
    if phone:
        if getattr(settings, 'ASYNC_TASKS_ENABLED', False):
            send_notification_task.delay(
                channel=NotificationLog.Channel.SMS,
                recipient_email=None,
                recipient_phone=phone,
                subject='OTP',
                message=message,
                created_by_id=request.user.id if request.user.is_authenticated else None,
                metadata={'otp_type': otp_type}
            )
        else:
            log_and_send(
                channel=NotificationLog.Channel.SMS,
                recipient_email=None,
                recipient_phone=phone,
                subject='OTP',
                message=message,
                created_by=request.user if request.user.is_authenticated else None,
                metadata={'otp_type': otp_type}
            )

    # For development, return OTP in response
    return Response({
        'message': 'OTP sent successfully',
        'otp': otp.otp_code if request.user.is_authenticated and request.user.is_admin else None,
        'expires_in': 10
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """Verify OTP and return JWT token."""
    serializer = OTPVerifySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    email = serializer.validated_data.get('email')
    phone = serializer.validated_data.get('phone')
    otp_code = serializer.validated_data.get('otp_code')

    if email:
        email = email.strip().lower()
    if phone:
        phone = format_phone_number(phone)
    
    # Find user
    user = None
    if email:
        user = User.objects.filter(email=email).first()
    elif phone:
        user = User.objects.filter(phone=phone).first()
    
    if not user:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Verify OTP
    otp = OTP.objects.filter(
        user=user,
        otp_code=otp_code,
        is_used=False
    ).order_by('-created_at').first()
    
    if not otp or not otp.is_valid():
        return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Mark OTP as used
    otp.is_used = True
    otp.save()

    # Mark user as verified and fill missing contact fields
    updated_fields = []
    if not user.is_verified:
        user.is_verified = True
        updated_fields.append('is_verified')
    if email and not user.email:
        user.email = email
        updated_fields.append('email')
    if phone and not user.phone:
        user.phone = phone
        updated_fields.append('phone')
    if updated_fields:
        user.save(update_fields=updated_fields)
    
    # Generate JWT tokens
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'email': user.email,
            'phone': user.phone,
            'role': user.role,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_verified': user.is_verified
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    """Request password reset OTP."""
    serializer = PasswordResetSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    email = serializer.validated_data['email']
    user = User.objects.filter(email=email).first()
    
    if not user:
        # Don't reveal if user exists
        return Response({'message': 'If the email exists, an OTP has been sent'})
    
    # Create OTP
    otp = OTP.create_otp(user, 'PASSWORD_RESET')
    
    message = f'Your password reset OTP is {otp.otp_code}. It expires in 10 minutes.'
    if getattr(settings, 'ASYNC_TASKS_ENABLED', False):
        send_notification_task.delay(
            channel=NotificationLog.Channel.EMAIL,
            recipient_email=email,
            recipient_phone=None,
            subject='Password Reset OTP',
            message=message,
            created_by_id=None,
            metadata={'otp_type': 'PASSWORD_RESET'}
        )
    else:
        log_and_send(
            channel=NotificationLog.Channel.EMAIL,
            recipient_email=email,
            recipient_phone=None,
            subject='Password Reset OTP',
            message=message,
            created_by=None,
            metadata={'otp_type': 'PASSWORD_RESET'}
        )
    
    return Response({'message': 'Password reset OTP sent successfully'})


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """Confirm password reset with OTP."""
    serializer = PasswordResetConfirmSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    email = serializer.validated_data['email']
    otp_code = serializer.validated_data['otp_code']
    new_password = serializer.validated_data['new_password']
    
    user = User.objects.filter(email=email).first()
    if not user:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Verify OTP
    otp = OTP.objects.filter(
        user=user,
        otp_code=otp_code,
        otp_type='PASSWORD_RESET',
        is_used=False
    ).order_by('-created_at').first()
    
    if not otp or not otp.is_valid():
        return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Update password
    user.set_password(new_password)
    user.save()
    
    # Mark OTP as used
    otp.is_used = True
    otp.save()
    
    return Response({'message': 'Password reset successful'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout user (client should delete tokens)."""
    return Response({'message': 'Logged out successfully'})
