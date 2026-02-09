from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import WarrantyViewSet, WarrantyClaimViewSet, verify_warranty

router = DefaultRouter()
router.register(r'claims', WarrantyClaimViewSet, basename='warranty-claim')
router.register(r'', WarrantyViewSet, basename='warranty')

urlpatterns = [
	path('', include(router.urls)),
	path('verify/<str:serial_number>/', verify_warranty, name='warranty-verify'),
]
