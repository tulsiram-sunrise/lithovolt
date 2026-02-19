<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StaffUser;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StaffUserController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
        $this->middleware('admin');
    }

    public function index(Request $request): JsonResponse
    {
        $query = StaffUser::with('user', 'role', 'supervisor');

        if ($request->has('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $staffUsers = $query->get();
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
            'is_active' => 'boolean|default:true',
            'notes' => 'nullable|string',
        ]);

        // Ensure user is an admin
        $user = User::findOrFail($validated['user_id']);
        if ($user->role !== 'admin') {
            return response()->json([
                'error' => 'Only admin users can be assigned staff roles'
            ], 422);
        }

        // Ensure supervisor is admin or staff
        if ($validated['supervisor_id'] ?? false) {
            $supervisor = User::findOrFail($validated['supervisor_id']);
            if ($supervisor->role !== 'admin' && !$supervisor->staffUser) {
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

        if (isset($validated['supervisor_id']) && $validated['supervisor_id']) {
            $supervisor = User::findOrFail($validated['supervisor_id']);
            if ($supervisor->role !== 'admin' && !$supervisor->staffUser) {
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
}
