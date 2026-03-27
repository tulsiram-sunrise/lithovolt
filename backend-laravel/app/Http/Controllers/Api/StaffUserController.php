<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StaffUser;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class StaffUserController extends Controller
{
    private const RESERVED_CORE_ROLES = ['ADMIN', 'WHOLESALER', 'CONSUMER', 'RETAILER'];

    public function __construct()
    {
        $this->middleware('admin');
    }

    public function index(Request $request): JsonResponse
    {
        $query = StaffUser::with('user', 'role', 'supervisor');
        $pageSize = min(max((int) $request->query('page_size', 10), 1), 100);

        if ($request->has('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->filled('search')) {
            $term = trim((string) $request->query('search'));
            $query->where(function ($inner) use ($term) {
                $inner->where('notes', 'like', "%{$term}%")
                    ->orWhereHas('user', function ($userQuery) use ($term) {
                        $userQuery->where('first_name', 'like', "%{$term}%")
                            ->orWhere('last_name', 'like', "%{$term}%")
                            ->orWhere('email', 'like', "%{$term}%");
                    })
                    ->orWhereHas('role', function ($roleQuery) use ($term) {
                        $roleQuery->where('name', 'like', "%{$term}%");
                    });
            });
        }

        $staffUsers = $query
            ->orderByDesc('updated_at')
            ->paginate($pageSize)
            ->appends($request->query());

        return response()->json($staffUsers);
    }

    public function show($id): JsonResponse
    {
        $staffUser = StaffUser::with('user', 'role', 'supervisor', 'role.permissions')->findOrFail($id);
        return response()->json($staffUser);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id|unique:staff_users',
            'role_id' => 'required|exists:roles,id',
            'supervisor_id' => 'nullable|exists:users,id',
            'hire_date' => 'nullable|date',
            'is_active' => 'sometimes|boolean',
            'notes' => 'nullable|string',
        ]);

        if (!array_key_exists('is_active', $validated)) {
            $validated['is_active'] = true;
        }

        if (empty($validated['hire_date'])) {
            $validated['hire_date'] = now()->toDateString();
        }

        // Ensure user is an admin
        $user = User::findOrFail($validated['user_id']);
        if (strtoupper((string) $user->role) !== 'ADMIN') {
            return response()->json([
                'error' => 'Only admin users can be assigned staff roles'
            ], 422);
        }

        $role = Role::findOrFail($validated['role_id']);
        $this->assertAssignableStaffRole($role);

        // Ensure supervisor is admin or staff
        if ($validated['supervisor_id'] ?? false) {
            if ((int) $validated['supervisor_id'] === (int) $validated['user_id']) {
                return response()->json([
                    'error' => 'Supervisor cannot be the same as assigned user'
                ], 422);
            }

            $supervisor = User::findOrFail($validated['supervisor_id']);
            if (strtoupper((string) $supervisor->role) !== 'ADMIN' && !$supervisor->staffUser) {
                return response()->json([
                    'error' => 'Supervisor must be an admin or staff member'
                ], 422);
            }
        }

        $staffUser = StaffUser::create($validated);
        return response()->json($staffUser->load('user', 'role', 'supervisor'), 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $staffUser = StaffUser::findOrFail($id);
        
        $validated = $request->validate([
            'role_id' => 'exists:roles,id',
            'supervisor_id' => 'nullable|exists:users,id',
            'is_active' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        if (isset($validated['role_id'])) {
            $role = Role::findOrFail($validated['role_id']);
            $this->assertAssignableStaffRole($role);
        }

        if (isset($validated['supervisor_id']) && $validated['supervisor_id']) {
            if ((int) $validated['supervisor_id'] === (int) $staffUser->user_id) {
                return response()->json([
                    'error' => 'Supervisor cannot be the same as assigned user'
                ], 422);
            }

            $supervisor = User::findOrFail($validated['supervisor_id']);
            if (strtoupper((string) $supervisor->role) !== 'ADMIN' && !$supervisor->staffUser) {
                return response()->json([
                    'error' => 'Supervisor must be an admin or staff member'
                ], 422);
            }
        }

        $staffUser->update($validated);
        return response()->json($staffUser->load('user', 'role', 'supervisor'));
    }

    public function destroy($id): JsonResponse
    {
        $staffUser = StaffUser::findOrFail($id);
        $staffUser->delete();
        
        return response()->json(null, 204);
    }

    private function assertAssignableStaffRole(Role $role): void
    {
        $roleName = strtoupper((string) $role->name);

        if (!$role->is_active) {
            throw ValidationException::withMessages([
                'role_id' => ['Inactive roles cannot be assigned to backoffice staff.'],
            ]);
        }

        if (in_array($roleName, self::RESERVED_CORE_ROLES, true)) {
            throw ValidationException::withMessages([
                'role_id' => ['Core platform roles cannot be assigned as backoffice staff roles. Create a dedicated limited role group.'],
            ]);
        }
    }
}
