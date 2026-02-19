from django.contrib import admin

from .models import Warranty, WarrantyClaim, WarrantyClaimAttachment, ClaimStatusHistory


@admin.register(Warranty)
class WarrantyAdmin(admin.ModelAdmin):
    list_display = ['warranty_number', 'serial_number', 'consumer', 'status', 'start_date', 'end_date']
    list_filter = ['status']
    search_fields = ['warranty_number', 'serial_number__serial_number', 'consumer__email']
    readonly_fields = ['created_at', 'updated_at', 'issued_at', 'start_date', 'end_date']


@admin.register(WarrantyClaim)
class WarrantyClaimAdmin(admin.ModelAdmin):
    list_display = ['id', 'warranty', 'consumer', 'status', 'assigned_to', 'reviewed_by', 'resolution_date']
    list_filter = ['status', 'resolution_date']
    search_fields = ['warranty__warranty_number', 'consumer__email', 'assigned_to__email', 'reviewed_by__email']
    readonly_fields = ['created_at', 'updated_at', 'resolution_date']
    fieldsets = (
        ('Claim Info', {'fields': ('warranty', 'consumer', 'description')}),
        ('Status', {'fields': ('status', 'resolution_date')}),
        ('Assignment & Review', {'fields': ('assigned_to', 'reviewed_by', 'review_notes')}),
        ('Audit', {'fields': ('created_at', 'updated_at')}),
    )


@admin.register(WarrantyClaimAttachment)
class WarrantyClaimAttachmentAdmin(admin.ModelAdmin):
    list_display = ['claim', 'file', 'created_at']
    search_fields = ['claim__id']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ClaimStatusHistory)
class ClaimStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ['claim', 'from_status', 'to_status', 'changed_by', 'created_at']
    list_filter = ['from_status', 'to_status']
    search_fields = ['claim__id', 'changed_by__email']
    readonly_fields = ['created_at', 'updated_at']
