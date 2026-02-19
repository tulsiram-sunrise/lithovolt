"""
Permissions for role-based access control.
"""
from rest_framework import permissions
from functools import wraps


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


# Resource-based permission checking utilities
def has_resource_permission(user, resource, action):
    """
    Check if a user has permission to perform an action on a resource.
    
    Args:
        user: User instance
        resource: str, resource name (INVENTORY, ORDERS, WARRANTY_CLAIMS, USERS, REPORTS, SETTINGS)
        action: str, action name (VIEW, CREATE, UPDATE, DELETE, APPROVE, ASSIGN)
    
    Returns:
        bool: True if user has permission, False otherwise
    """
    # Admin has all permissions
    if user.role == 'ADMIN':
        return True
    
    # Staff members check their permissions
    if hasattr(user, 'staff_profile'):
        staff_profile = user.staff_profile
        if not staff_profile.is_active:
            return False
        
        if staff_profile.role:
            # Check if staff has permission
            from users.models import Permission
            has_perm = Permission.objects.filter(
                role=staff_profile.role,
                resource=resource,
                action=action
            ).exists()
            return has_perm
    
    return False


def require_resource_permission(resource, action):
    """
    Decorator to check if user has permission for a resource action.
    
    Usage:
        @require_resource_permission('ORDERS', 'CREATE')
        def create_order(request):
            ...
    """
    def decorator(func):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            if not has_resource_permission(request.user, resource, action):
                raise permissions.PermissionDenied(
                    f'You do not have permission to {action.lower()} {resource.lower()}'
                )
            return func(self, request, *args, **kwargs)
        return wrapper
    return decorator


class ResourcePermission(permissions.BasePermission):
    """
    Permission class for resource-based access control.
    Subclasses should define required_resource and required_actions.
    """
    required_resource = None
    required_actions = {}  # Map HTTP method to required action
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not self.required_resource:
            return True
        
        # Map HTTP methods to actions
        method_action_map = {
            'GET': 'VIEW',
            'POST': 'CREATE',
            'PUT': 'UPDATE',
            'PATCH': 'UPDATE',
            'DELETE': 'DELETE',
        }
        
        action = method_action_map.get(request.method, 'VIEW')
        return has_resource_permission(request.user, self.required_resource, action)
