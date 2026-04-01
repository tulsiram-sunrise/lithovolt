<?php

namespace App\Services;

use App\Models\Permission;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Schema;

class EntityAccessService
{
    /**
     * Check if user has permission for a resource action.
     *
     * @param User $user
     * @param string $resource (e.g., 'INVENTORY', 'ORDERS', 'WARRANTY_CLAIMS', 'USERS', 'REPORTS', 'SETTINGS')
     * @param string $action (e.g., 'VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'ASSIGN')
     * @return bool
     */
    public function hasPermission(User $user, string $resource, string $action): bool
    {
        // Super-admin bypass
        if ($this->isSuperAdmin($user)) {
            return true;
        }

        // Must have active staff assignment
        if (!$this->hasActiveStaffAssignment($user)) {
            return false;
        }

        $resource = strtoupper($resource);
        $action = strtoupper($action);

        // Load staff role and permissions if not already loaded
        if (!$user->relationLoaded('staffUser')) {
            $user->load('staffUser.role.permissions');
        } else if ($user->staffUser && !$user->staffUser->relationLoaded('role')) {
            $user->staffUser->load('role.permissions');
        }

        // Check if role has the required permission
        return $user->staffUser->role
            ->permissions
            ->contains(fn ($permission) => 
                strtoupper((string) $permission->resource) === $resource
                && strtoupper((string) $permission->action) === $action
            );
    }

    /**
     * Apply entity visibility scope based on user's role and resource.
     * Returns a closure that can be used with query builder.
     *
     * @param User $user
     * @param string $resource (e.g., 'INVENTORY', 'ORDERS', 'WARRANTY_CLAIMS', etc.)
     * @return \Closure|null
     */
    public function getVisibilityScope(User $user, string $resource): ?\Closure
    {
        // Super-admin sees everything
        if ($this->isSuperAdmin($user)) {
            return null; // No scope needed
        }

        // Must have staff assignment
        if (!$user->staffUser) {
            return fn (Builder $query) => $query->whereRaw('1 = 0'); // Hide everything
        }

        $resource = strtoupper($resource);
        $roleName = strtoupper($user->staffUser->role?->name ?? '');
        $hasOrderAssignmentsTable = Schema::hasTable('order_staff_assignments');
        $hasWarrantyClaimAssignmentsTable = Schema::hasTable('warranty_claim_staff_assignments');

        // Role-based visibility rules
        return match ($resource) {
            // INVENTORY items: MANAGER/TECH see all, others see active only
            'INVENTORY' => function (Builder $query) use ($roleName) {
                if (in_array($roleName, ['MANAGER', 'TECH'])) {
                    return $query; // No restriction
                }
                return $query->where('is_active', true);
            },

            // ORDERS: MANAGER sees all, SALES/SUPPORT see assigned or created, TECH sees none
            'ORDERS' => function (Builder $query) use ($user, $roleName, $hasOrderAssignmentsTable) {
                if ($roleName === 'MANAGER') {
                    return $query; // Manager sees all
                }
                if ($roleName === 'SALES') {
                    // Sales sees orders they created or are assigned to
                    if (!$hasOrderAssignmentsTable) {
                        return $query->where('user_id', $user->id);
                    }

                    return $query->where(function ($q) use ($user) {
                        $q->where('user_id', $user->id)
                          ->orWhereExists(function ($subquery) use ($user) {
                              $subquery->selectRaw(1)
                                  ->from('order_staff_assignments')
                                  ->whereColumn('order_staff_assignments.order_id', 'orders.id')
                                  ->where('order_staff_assignments.user_id', $user->id);
                          });
                    });
                }
                if ($roleName === 'SUPPORT') {
                    // Support sees orders assigned to them
                    if (!$hasOrderAssignmentsTable) {
                        return $query->whereRaw('1 = 0');
                    }

                    return $query->whereExists(function ($subquery) use ($user) {
                        $subquery->selectRaw(1)
                            ->from('order_staff_assignments')
                            ->whereColumn('order_staff_assignments.order_id', 'orders.id')
                            ->where('order_staff_assignments.user_id', $user->id);
                    });
                }
                // TECH cannot see orders
                return $query->whereRaw('1 = 0');
            },

            // WARRANTY_CLAIMS: MANAGER/SUPPORT see assigned claims or all if manager, TECH/SALES see none
            'WARRANTY_CLAIMS' => function (Builder $query) use ($user, $roleName, $hasWarrantyClaimAssignmentsTable) {
                if ($roleName === 'MANAGER') {
                    return $query; // Manager sees all
                }
                if ($roleName === 'SUPPORT') {
                    // Support sees claims assigned to them
                    if (!$hasWarrantyClaimAssignmentsTable) {
                        return $query->whereRaw('1 = 0');
                    }

                    return $query->whereExists(function ($subquery) use ($user) {
                        $subquery->selectRaw(1)
                            ->from('warranty_claim_staff_assignments')
                            ->whereColumn('warranty_claim_staff_assignments.warranty_claim_id', 'warranty_claims.id')
                            ->where('warranty_claim_staff_assignments.user_id', $user->id);
                    });
                }
                // TECH/SALES cannot see claims
                return $query->whereRaw('1 = 0');
            },

            // USERS (backoffice only): MANAGER sees all, others see none
            'USERS' => function (Builder $query) use ($roleName) {
                if ($roleName === 'MANAGER') {
                    return $query; // Manager sees all
                }
                // SALES can see consumers, SUPPORT/TECH cannot see backoffice users
                if ($roleName === 'SALES') {
                    return $query->whereHas('role', function (Builder $roleQuery) {
                        $roleQuery->where('name', 'CONSUMER');
                    });
                }
                return $query->whereRaw('1 = 0');
            },

            // REPORTS: MANAGER/SUPPORT/TECH see all reports they have permission for
            'REPORTS' => function (Builder $query) use ($roleName) {
                if (in_array($roleName, ['MANAGER', 'SUPPORT', 'TECH', 'SALES'])) {
                    return $query; // Return all reports; access control handled by VIEW permission
                }
                return $query->whereRaw('1 = 0');
            },

            // SETTINGS: MANAGER/TECH see all, others see none
            'SETTINGS' => function (Builder $query) use ($roleName) {
                if (in_array($roleName, ['MANAGER', 'TECH'])) {
                    return $query; // No restriction
                }
                return $query->whereRaw('1 = 0');
            },

            // Default: deny access
            default => fn (Builder $query) => $query->whereRaw('1 = 0'),
        };
    }

    /**
     * Apply visibility scope to a query builder.
     *
     * @param User $user
     * @param string $resource
     * @param Builder $query
     * @return Builder
     */
    public function applyVisibility(User $user, string $resource, Builder $query): Builder
    {
        $scope = $this->getVisibilityScope($user, $resource);
        return $scope ? $scope($query) : $query;
    }

    /**
     * Check if user is a super-admin (can bypass all restrictions).
     *
     * @param User $user
     * @return bool
     */
    private function isSuperAdmin(User $user): bool
    {
        $superAdminEmails = explode(',', config('auth.backoffice_super_admin_emails', 'admin@lithovolt.com.au'));
        return in_array($user->email, array_map('trim', $superAdminEmails));
    }

    /**
     * Check if user has an active staff assignment.
     *
     * @param User $user
     * @return bool
     */
    private function hasActiveStaffAssignment(User $user): bool
    {
        if (!$user->relationLoaded('staffUser')) {
            $user->load('staffUser');
        }

        return $user->staffUser 
            && $user->staffUser->is_active 
            && $user->staffUser->role 
            && $user->staffUser->role->is_active;
    }
}
