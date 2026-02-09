from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'consumer', 'wholesaler', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['id', 'consumer__email', 'wholesaler__email']
    readonly_fields = ['created_at', 'updated_at', 'accepted_at', 'fulfilled_at']
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product_type', 'battery_model', 'accessory', 'quantity', 'created_at']
    list_filter = ['product_type']
    search_fields = ['order__id', 'battery_model__name', 'accessory__name']
    readonly_fields = ['created_at', 'updated_at']
