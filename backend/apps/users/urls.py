from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, WholesalerApplicationViewSet

router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')

wholesaler_router = DefaultRouter()
wholesaler_router.register(r'', WholesalerApplicationViewSet, basename='wholesaler-application')

urlpatterns = [
	path('wholesaler-applications/', include(wholesaler_router.urls)),
    path('', include(router.urls)),
]
