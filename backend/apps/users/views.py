"""
Views for User management.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from core.permissions import IsAdmin, IsAdminOrWholesaler
from .models import User, WholesalerApplication, Role, Permission, StaffUser
from .serializers import (
    UserSerializer, UserCreateSerializer, UserUpdateSerializer,
    WholesalerListSerializer, WholesalerApplicationSerializer,
    WholesalerApplicationCreateSerializer, RoleSerializer, PermissionSerializer,
    StaffUserSerializer, StaffUserCreateUpdateSerializer
)


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for User CRUD operations.
    Admin can manage all users, others can only view/update their own profile.
    """
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['role', 'is_active', 'city', 'state']
    search_fields = ['email', 'first_name', 'last_name', 'company_name', 'phone']
    ordering_fields = ['created_at', 'email', 'first_name']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        elif self.action == 'wholesalers':
            return WholesalerListSerializer
        return UserSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsAdmin()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return User.objects.all()
        return User.objects.filter(id=user.id)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current user's profile."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_profile(self, request):
        """Update current user's profile."""
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminOrWholesaler])
    def wholesalers(self, request):
        """Get list of all wholesalers."""
        wholesalers = User.objects.filter(role='WHOLESALER', is_active=True)
        serializer = WholesalerListSerializer(wholesalers, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def toggle_active(self, request, pk=None):
        """Activate or deactivate a user."""
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response({
            'message': f'User {"activated" if user.is_active else "deactivated"} successfully',
            'is_active': user.is_active
        })


class WholesalerApplicationViewSet(viewsets.ModelViewSet):
    """Manage wholesaler onboarding applications."""

    queryset = WholesalerApplication.objects.select_related('user', 'reviewed_by')
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['business_name', 'registration_number', 'user__email']
    ordering_fields = ['created_at', 'reviewed_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return WholesalerApplicationCreateSerializer
        return WholesalerApplicationSerializer

    def get_permissions(self):
        if self.action in ['approve', 'reject', 'destroy']:
            return [IsAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return self.queryset
        return self.queryset.filter(user=user)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get the latest application for the current user."""
        app = self.queryset.filter(user=request.user).first()
        if not app:
            return Response({'detail': 'No application found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(WholesalerApplicationSerializer(app).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        """Approve a wholesaler application and upgrade user role."""
        application = self.get_object()
        application.status = WholesalerApplication.Status.APPROVED
        application.review_notes = request.data.get('review_notes', '')
        application.reviewed_by = request.user
        application.reviewed_at = timezone.now()
        application.save(update_fields=['status', 'review_notes', 'reviewed_by', 'reviewed_at'])

        user = application.user
        user.role = 'WHOLESALER'
        user.company_name = application.business_name
        if application.contact_email and not user.email:
            user.email = application.contact_email
        if application.contact_phone and not user.phone:
            user.phone = application.contact_phone
        user.save()

        return Response(WholesalerApplicationSerializer(application).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def reject(self, request, pk=None):
        """Reject a wholesaler application."""
        application = self.get_object()
        application.status = WholesalerApplication.Status.REJECTED
        application.review_notes = request.data.get('review_notes', '')
        application.reviewed_by = request.user
        application.reviewed_at = timezone.now()
        application.save(update_fields=['status', 'review_notes', 'reviewed_by', 'reviewed_at'])
        return Response(WholesalerApplicationSerializer(application).data)


class RoleViewSet(viewsets.ModelViewSet):
    """ViewSet for managing roles for staff users."""
    
    queryset = Role.objects.prefetch_related('permissions', 'staff_users')
    serializer_class = RoleSerializer
    permission_classes = [IsAdmin]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']


class PermissionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing permissions."""
    
    queryset = Permission.objects.select_related('role')
    serializer_class = PermissionSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['role', 'resource', 'action']
    search_fields = ['description']


class StaffUserViewSet(viewsets.ModelViewSet):
    """ViewSet for managing staff users and their roles."""
    
    queryset = StaffUser.objects.select_related('user', 'role', 'supervisor')
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['role', 'is_active']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    ordering_fields = ['hire_date', 'user__first_name']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return StaffUserCreateUpdateSerializer
        return StaffUserSerializer
