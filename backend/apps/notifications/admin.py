from django.contrib import admin

from .models import NotificationLog, NotificationSetting


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ['channel', 'status', 'recipient_email', 'recipient_phone', 'created_at']
    list_filter = ['channel', 'status']
    search_fields = ['recipient_email', 'recipient_phone', 'subject']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(NotificationSetting)
class NotificationSettingAdmin(admin.ModelAdmin):
    list_display = ['email_enabled', 'sms_enabled', 'from_email', 'sms_provider', 'created_at']
    readonly_fields = ['created_at', 'updated_at']
