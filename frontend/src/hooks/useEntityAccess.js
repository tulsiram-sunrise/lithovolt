import { useCallback } from 'react';

/**
 * Hook to check if current user has access to view/manage entities in a resource
 * Based on user's role and permission level
 */
export const useEntityAccess = () => {
  const checkAccess = useCallback((resource, action = 'VIEW') => {
    // This will be populated from user's staff role permissions
    // Format: { resource: string, action: string }[]
    const userPermissions = window.__userPermissions || [];
    
    const hasPermission = userPermissions.some(
      (perm) =>
        perm.resource?.toUpperCase() === resource?.toUpperCase() &&
        perm.action?.toUpperCase() === action?.toUpperCase()
    );

    return hasPermission;
  }, []);

  const canView = useCallback((resource) => checkAccess(resource, 'VIEW'), [checkAccess]);
  const canCreate = useCallback((resource) => checkAccess(resource, 'CREATE'), [checkAccess]);
  const canUpdate = useCallback((resource) => checkAccess(resource, 'UPDATE'), [checkAccess]);
  const canDelete = useCallback((resource) => checkAccess(resource, 'DELETE'), [checkAccess]);

  return {
    checkAccess,
    canView,
    canCreate,
    canUpdate,
    canDelete,
  };
};

/**
 * Hook to get access status text for display purposes
 */
export const useAccessStatusText = () => {
  const getStatusText = useCallback((resource, action = 'VIEW') => {
    const actionText = action.charAt(0) + action.slice(1).toLowerCase();
    const resourceText = resource.charAt(0) + resource.slice(1).toLowerCase();
    
    return `You don't have permission to ${actionText.toLowerCase()} ${resourceText.toLowerCase()}`;
  }, []);

  return { getStatusText };
};

export default useEntityAccess;
