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
    private const RESERVED_CORE_ROLES = ['ADMIN', 'WHOLESALER', 'CONSUMER', 'RETAILER'];

    public function __construct()
    {
        $this->middleware('auth:jwt');
        $this->middleware('admin');
    }

    public function index(): JsonResponse
    {
        $request = request();
        $pageSize = min(max((int) $request->query('page_size', 10), 1), 100);

        $query = Role::with('permissions', 'staffUsers');

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->filled('search')) {
            $term = trim((string) $request->query('search'));
            $query->where(function ($inner) use ($term) {
                $inner->where('name', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%");
            });
        }

        $roles = $query
            ->orderByDesc('updated_at')
            ->paginate($pageSize)
            ->appends($request->query());

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
            'is_active' => 'sometimes|boolean',
        ]);

        if (!array_key_exists('is_active', $validated)) {
            $validated['is_active'] = true;
        }

        $validated['name'] = strtoupper(trim($validated['name']));

        if (in_array($validated['name'], self::RESERVED_CORE_ROLES, true)) {
            throw ValidationException::withMessages([
                'name' => ['Core platform role names are reserved. Create a dedicated limited role group name.'],
            ]);
        }

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
