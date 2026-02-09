from django.contrib import admin

from .models import BatteryModel, Accessory, SerialNumber, StockAllocation


@admin.register(BatteryModel)
class BatteryModelAdmin(admin.ModelAdmin):
    list_display = ['name', 'sku', 'warranty_months', 'low_stock_threshold', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'sku', 'model_number']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Accessory)
class AccessoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'sku', 'price', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'sku']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(SerialNumber)
class SerialNumberAdmin(admin.ModelAdmin):
    list_display = ['serial_number', 'battery_model', 'status', 'allocated_to', 'sold_to', 'created_at']
    list_filter = ['status', 'battery_model']
    search_fields = ['serial_number', 'battery_model__name', 'battery_model__sku']
    readonly_fields = ['created_at', 'updated_at', 'allocated_at', 'sold_at']


@admin.register(StockAllocation)
class StockAllocationAdmin(admin.ModelAdmin):
    list_display = ['battery_model', 'wholesaler', 'quantity', 'allocated_by', 'created_at']
    list_filter = ['battery_model']
    search_fields = ['battery_model__name', 'wholesaler__email']
    readonly_fields = ['created_at', 'updated_at']
