from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, WholesalerApplicationViewSet, RoleViewSet,
    PermissionViewSet, StaffUserViewSet
)

router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'permissions', PermissionViewSet, basename='permission')
router.register(r'staff', StaffUserViewSet, basename='staff-user')

wholesaler_router = DefaultRouter()
wholesaler_router.register(r'', WholesalerApplicationViewSet, basename='wholesaler-application')

urlpatterns = [
	path('wholesaler-applications/', include(wholesaler_router.urls)),
    path('', include(router.urls)),
]
