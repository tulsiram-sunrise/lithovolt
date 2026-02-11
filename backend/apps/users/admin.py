from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile, WholesalerApplication


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'first_name', 'last_name', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'is_verified']
    search_fields = ['email', 'first_name', 'last_name', 'phone', 'company_name']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone')}),
        ('Business Info', {'fields': ('role', 'company_name', 'gst_number')}),
        ('Address', {'fields': ('address', 'city', 'state', 'pincode')}),
        ('Permissions', {'fields': ('is_active', 'is_verified', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'role'),
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'last_login']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'credit_limit', 'outstanding_balance', 'created_at']
    search_fields = ['user__email', 'user__first_name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(WholesalerApplication)
class WholesalerApplicationAdmin(admin.ModelAdmin):
    list_display = ['user', 'business_name', 'status', 'created_at', 'reviewed_at']
    list_filter = ['status']
    search_fields = ['user__email', 'business_name', 'registration_number']
    readonly_fields = ['created_at', 'updated_at', 'reviewed_at']
