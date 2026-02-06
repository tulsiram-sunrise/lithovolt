"""Authentication app models."""
from django.db import models
from django.contrib.auth import get_user_model
from core.models import TimeStampedModel
from core.utils import generate_random_code
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class OTP(TimeStampedModel):
    """OTP model for phone/email verification."""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otps')
    otp_code = models.CharField(max_length=6)
    otp_type = models.CharField(max_length=20, choices=[
        ('LOGIN', 'Login'),
        ('VERIFICATION', 'Verification'),
        ('PASSWORD_RESET', 'Password Reset'),
    ])
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'otps'
        ordering = ['-created_at']
    
    def __str__(self):
        return f'OTP for {self.user.email}'
    
    @classmethod
    def create_otp(cls, user, otp_type='LOGIN', validity_minutes=10):
        """Create a new OTP."""
        otp_code = generate_random_code(length=6, digits_only=True)
        expires_at = timezone.now() + timedelta(minutes=validity_minutes)
        
        return cls.objects.create(
            user=user,
            otp_code=otp_code,
            otp_type=otp_type,
            expires_at=expires_at
        )
    
    def is_valid(self):
        """Check if OTP is still valid."""
        return not self.is_used and timezone.now() < self.expires_at
