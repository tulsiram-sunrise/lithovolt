<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('role')->paginate(10);
        return response()->json($users);
    }

    public function show($id)
    {
        $user = User::with('role', 'orders', 'warranties')->findOrFail($id);
        return response()->json($user);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|unique:users,phone',
            'company_name' => 'nullable|string',
            'company_registration' => 'nullable|string',
            'role_id' => 'nullable|integer|exists:roles,id',
            'password' => 'required|string|min:6',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);
        return response()->json(['message' => 'User created successfully', 'user' => $user], 201);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|unique:users,phone,' . $user->id,
            'company_name' => 'nullable|string',
            'email' => 'nullable|email|unique:users,email,' . $user->id,
        ]);

        $user->update($validated);
        return response()->json(['message' => 'User updated successfully', 'user' => $user]);
    }

    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }

    public function verifyEmail(User $user)
    {
        $user->update(['is_verified' => true]);
        return response()->json(['message' => 'User verified successfully']);
    }
}
