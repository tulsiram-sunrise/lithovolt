<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use App\Models\StaffUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RoleController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
        $this->middleware('admin');
    }

    public function index(): JsonResponse
    {
        $roles = Role::with('permissions', 'staffUsers')->get();
        return response()->json($roles);
    }

    public function show($id): JsonResponse
    {
        $role = Role::with('permissions', 'staffUsers')->findOrFail($id);
        return response()->json($role);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles',
            'description' => 'nullable|string',
            'is_active' => 'boolean|default:true',
        ]);

        $role = Role::create($validated);
        return response()->json($role, 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $role = Role::findOrFail($id);
        
        $validated = $request->validate([
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $role->update($validated);
        return response()->json($role);
    }

    public function destroy($id): JsonResponse
    {
        $role = Role::findOrFail($id);
        
        if ($role->staffUsers()->exists()) {
            return response()->json([
                'error' => 'Cannot delete role with assigned staff members'
            ], 422);
        }

        $role->permissions()->delete();
        $role->delete();
        
        return response()->json(null, 204);
    }
}
