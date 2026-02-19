<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
        $this->middleware('admin');
    }

    public function index(Request $request): JsonResponse
    {
        $query = Permission::with('role');

        if ($request->has('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        if ($request->has('resource')) {
            $query->where('resource', $request->resource);
        }

        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        $permissions = $query->get();
        return response()->json($permissions);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
            'resource' => 'required|string|in:INVENTORY,ORDERS,WARRANTY_CLAIMS,USERS,REPORTS,SETTINGS',
            'action' => 'required|string|in:VIEW,CREATE,UPDATE,DELETE,APPROVE,ASSIGN',
            'description' => 'nullable|string',
        ]);

        // Check if permission already exists
        $existing = Permission::where('role_id', $validated['role_id'])
            ->where('resource', $validated['resource'])
            ->where('action', $validated['action'])
            ->first();

        if ($existing) {
            return response()->json([
                'error' => 'This permission already exists for this role'
            ], 422);
        }

        $permission = Permission::create($validated);
        return response()->json($permission, 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $permission = Permission::findOrFail($id);
        
        $validated = $request->validate([
            'description' => 'nullable|string',
        ]);

        $permission->update($validated);
        return response()->json($permission);
    }

    public function destroy($id): JsonResponse
    {
        $permission = Permission::findOrFail($id);
        $permission->delete();
        
        return response()->json(null, 204);
    }

    public function bulkAssign(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
            'permissions' => 'required|array',
            'permissions.*' => 'string|in:INVENTORY:VIEW,INVENTORY:CREATE,INVENTORY:UPDATE,INVENTORY:DELETE,ORDERS:VIEW,ORDERS:CREATE,ORDERS:UPDATE,ORDERS:DELETE,WARRANTY_CLAIMS:VIEW,WARRANTY_CLAIMS:APPROVE,WARRANTY_CLAIMS:ASSIGN,USERS:VIEW,USERS:CREATE,USERS:UPDATE,USERS:DELETE,REPORTS:VIEW,SETTINGS:UPDATE',
        ]);

        $role = Role::findOrFail($validated['role_id']);
        
        // Delete existing permissions
        $role->permissions()->delete();
        
        // Create new permissions
        foreach ($validated['permissions'] as $perm) {
            [$resource, $action] = explode(':', $perm);
            Permission::create([
                'role_id' => $role->id,
                'resource' => $resource,
                'action' => $action,
            ]);
        }

        return response()->json($role->load('permissions'), 200);
    }
}
