from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
	BatteryModelViewSet,
	SerialNumberViewSet,
	StockAllocationViewSet,
	AccessoryViewSet,
	ProductCategoryViewSet,
	ProductViewSet,
)

router = DefaultRouter()
router.register(r'models', BatteryModelViewSet, basename='battery-model')
router.register(r'accessories', AccessoryViewSet, basename='accessory')
router.register(r'categories', ProductCategoryViewSet, basename='product-category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'serials', SerialNumberViewSet, basename='serial-number')
router.register(r'allocations', StockAllocationViewSet, basename='stock-allocation')

urlpatterns = [
	path(
		'serials/generate/',
		SerialNumberViewSet.as_view({'post': 'generate'}),
		name='serial-number-generate'
	),
	path('', include(router.urls)),
]
