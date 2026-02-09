from django.contrib import admin

from .models import Warranty, WarrantyClaim, WarrantyClaimAttachment


@admin.register(Warranty)
class WarrantyAdmin(admin.ModelAdmin):
    list_display = ['warranty_number', 'serial_number', 'consumer', 'status', 'start_date', 'end_date']
    list_filter = ['status']
    search_fields = ['warranty_number', 'serial_number__serial_number', 'consumer__email']
    readonly_fields = ['created_at', 'updated_at', 'issued_at', 'start_date', 'end_date']


@admin.register(WarrantyClaim)
class WarrantyClaimAdmin(admin.ModelAdmin):
    list_display = ['warranty', 'consumer', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['warranty__warranty_number', 'consumer__email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(WarrantyClaimAttachment)
class WarrantyClaimAttachmentAdmin(admin.ModelAdmin):
    list_display = ['claim', 'file', 'created_at']
    search_fields = ['claim__id']
    readonly_fields = ['created_at', 'updated_at']
