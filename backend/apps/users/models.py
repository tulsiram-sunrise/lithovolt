"""
User models for the Lithovolt platform.
"""
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from core.models import TimeStampedModel
from core.utils import format_phone_number


class UserManager(BaseUserManager):
    """Custom user manager."""
    
    def create_user(self, email=None, password=None, **extra_fields):
        """Create and return a regular user."""
        phone = extra_fields.get('phone')
        role = extra_fields.get('role') or 'CONSUMER'

        if not email and role != 'CONSUMER':
            raise ValueError('Email is required for non-consumer users')
        if not email and not phone:
            raise ValueError('Either email or phone must be set')

        email = self.normalize_email(email) if email else None
        if phone:
            extra_fields['phone'] = format_phone_number(phone)

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and return a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin, TimeStampedModel):
    """Custom user model with role-based access."""
    
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('WHOLESALER', 'Wholesaler'),
        ('CONSUMER', 'Consumer'),
    )
    
    email = models.EmailField(unique=True, db_index=True, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True, db_index=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CONSUMER')
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    
    # Profile fields
    company_name = models.CharField(max_length=200, blank=True, null=True)
    gst_number = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    pincode = models.CharField(max_length=10, blank=True, null=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']
    
    def __str__(self):
        identifier = self.email or self.phone or 'Unknown'
        return f'{identifier} ({self.role})'
    
    def get_full_name(self):
        """Return the full name of the user."""
        return f'{self.first_name} {self.last_name}'.strip()
    
    def get_short_name(self):
        """Return the short name of the user."""
        return self.first_name
    
    @property
    def is_admin(self):
        """Check if user is admin."""
        return self.role == 'ADMIN'
    
    @property
    def is_wholesaler(self):
        """Check if user is wholesaler."""
        return self.role == 'WHOLESALER'
    
    @property
    def is_consumer(self):
        """Check if user is consumer."""
        return self.role == 'CONSUMER'


class UserProfile(TimeStampedModel):
    """Extended user profile information."""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Business details (for wholesalers)
    business_license = models.FileField(upload_to='licenses/', blank=True, null=True)
    credit_limit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    outstanding_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Preferences
    notification_email = models.BooleanField(default=True)
    notification_sms = models.BooleanField(default=True)
    notification_push = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f'Profile of {self.user.email}'


class WholesalerApplication(TimeStampedModel):
    """Wholesaler onboarding application."""

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wholesaler_applications')
    business_name = models.CharField(max_length=200)
    registration_number = models.CharField(max_length=100)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    document = models.FileField(upload_to='wholesaler_docs/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='wholesaler_applications_reviewed'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_notes = models.TextField(blank=True)

    class Meta:
        db_table = 'wholesaler_applications'
        ordering = ['-created_at']

    def __str__(self):
        return f'WholesalerApplication({self.user_id}, {self.status})'
