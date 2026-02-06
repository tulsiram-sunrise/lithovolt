"""
Permissions for role-based access control.
"""
from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    Permission class to check if user is an admin.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'


class IsWholesaler(permissions.BasePermission):
    """
    Permission class to check if user is a wholesaler.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'WHOLESALER'


class IsConsumer(permissions.BasePermission):
    """
    Permission class to check if user is a consumer.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'CONSUMER'


class IsAdminOrWholesaler(permissions.BasePermission):
    """
    Permission class to check if user is admin or wholesaler.
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['ADMIN', 'WHOLESALER']
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission class to check if user is owner of the object or admin.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'ADMIN':
            return True
        return obj.user == request.user or (hasattr(obj, 'owner') and obj.owner == request.user)
