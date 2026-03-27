<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class BackofficePermissionMiddleware
{
    private function isWhitelistedSuperAdmin(?string $email): bool
    {
        $value = (string) env('BACKOFFICE_SUPER_ADMIN_EMAILS', 'admin@lithovolt.com');
        $allowed = array_values(array_filter(array_map(
            static fn ($item) => strtolower(trim($item)),
            explode(',', $value)
        )));

        if (!$email) {
            return false;
        }

        return in_array(strtolower(trim($email)), $allowed, true);
    }

    public function handle(Request $request, Closure $next, string $resource, string $action)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $roleName = strtoupper((string) ($user?->role?->name ?? $user?->role ?? ''));
        if ($roleName !== 'ADMIN') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $user->loadMissing('staffUser.role.permissions');
        $staffProfile = $user->staffUser;

        // Only explicit super-admin identities can bypass staff role-group checks.
        if (!$staffProfile) {
            if ($this->isWhitelistedSuperAdmin($user->email)) {
                return $next($request);
            }

            return response()->json([
                'message' => 'Staff assignment required before accessing this action.',
            ], 403);
        }

        if (!$staffProfile->is_active) {
            return response()->json(['message' => 'Staff profile is inactive.'], 403);
        }

        $staffRole = $staffProfile->role;
        if (!$staffRole || !$staffRole->is_active) {
            return response()->json(['message' => 'Staff role is inactive or missing.'], 403);
        }

        $requiredResource = strtoupper(trim($resource));
        $requiredAction = strtoupper(trim($action));

        $hasPermission = $staffRole->permissions
            ->contains(fn ($permission) => strtoupper((string) $permission->resource) === $requiredResource
                && strtoupper((string) $permission->action) === $requiredAction);

        if (!$hasPermission) {
            return response()->json([
                'message' => 'Missing required permission.',
                'required' => $requiredResource . ':' . $requiredAction,
            ], 403);
        }

        return $next($request);
    }
}