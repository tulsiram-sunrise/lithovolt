<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Models\WholesalerApplication;
use App\Services\WholesalerInvitationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    private function isAdmin(?User $user): bool
    {
        return strtoupper((string) $user?->role) === 'ADMIN';
    }

    private function applicationStatusForApplication(WholesalerApplication $application, ?int $wholesalerRoleId): string
    {
        $userRoleId = (int) $application->user?->role_id;
        if ($wholesalerRoleId && $userRoleId === $wholesalerRoleId) {
            return 'approved';
        }

        return in_array($application->status, ['pending', 'approved', 'rejected'], true)
            ? $application->status
            : 'pending';
    }

    private function toWholesalerApplication(WholesalerApplication $application, ?int $wholesalerRoleId): array
    {
        $user = $application->user;

        return [
            'id' => $application->id,
            'user_id' => $application->user_id,
            'business_name' => $application->business_name,
            'registration_number' => $application->registration_number,
            'contact_email' => $user->email,
            'contact_phone' => $user->phone,
            'status' => $this->applicationStatusForApplication($application, $wholesalerRoleId),
            'created_at' => $application->created_at,
            'updated_at' => $application->updated_at,
        ];
    }

    public function index()
    {
        $users = User::with('role')->paginate(10);
        return response()->json($users);
    }

    public function getWholesalerApplications(Request $request)
    {
        $requestUser = $request->user();
        $wholesalerRole = Role::where('name', 'WHOLESALER')->first();
        $wholesalerRoleId = $wholesalerRole?->id;

        if ($this->isAdmin($requestUser)) {
            $applications = WholesalerApplication::with('user')
                ->orderByDesc('updated_at')
                ->get();
        } else {
            $applications = WholesalerApplication::with('user')
                ->where('user_id', $requestUser->id)
                ->orderByDesc('updated_at')
                ->get();
        }

        return response()->json(
            $applications->map(fn ($application) => $this->toWholesalerApplication($application, $wholesalerRoleId))->values()
        );
    }

    public function getWholesalerApplication(Request $request, int $id)
    {
        $requestUser = $request->user();

        $application = WholesalerApplication::with('user')->findOrFail($id);

        if (!$this->isAdmin($requestUser) && $requestUser->id !== (int) $application->user_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $wholesalerRoleId = Role::where('name', 'WHOLESALER')->value('id');

        return response()->json($this->toWholesalerApplication($application, $wholesalerRoleId));
    }

    public function submitWholesalerApplication(Request $request)
    {
        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'registration_number' => 'required|string|max:255',
        ]);

        $user = $request->user();
        $application = WholesalerApplication::updateOrCreate(
            ['user_id' => $user->id],
            [
                'business_name' => $validated['business_name'],
                'registration_number' => $validated['registration_number'],
                'status' => 'pending',
                'review_notes' => null,
                'reviewed_by' => null,
                'reviewed_at' => null,
            ]
        );

        $wholesalerRoleId = Role::where('name', 'WHOLESALER')->value('id');
        return response()->json([
            'message' => 'Wholesaler application submitted successfully',
            'application' => $this->toWholesalerApplication($application->fresh('user'), $wholesalerRoleId),
        ], 201);
    }

    public function approveWholesalerApplication(Request $request, int $id)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $wholesalerRole = Role::where('name', 'WHOLESALER')->first();
        if (!$wholesalerRole) {
            return response()->json(['message' => 'WHOLESALER role is not configured.'], 500);
        }

        $application = WholesalerApplication::with('user')->findOrFail($id);
        $user = $application->user;

        if (!$user) {
            return response()->json(['message' => 'Application user not found.'], 404);
        }

        $user->update([
            'role_id' => $wholesalerRole->id,
        ]);

        $application->update([
            'status' => 'approved',
            'review_notes' => (string) $request->input('notes', ''),
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Wholesaler application approved',
            'application' => $this->toWholesalerApplication($application->fresh('user'), $wholesalerRole->id),
        ]);
    }

    public function rejectWholesalerApplication(Request $request, int $id)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $consumerRole = Role::where('name', 'CONSUMER')->first();
        if (!$consumerRole) {
            return response()->json(['message' => 'CONSUMER role is not configured.'], 500);
        }

        $application = WholesalerApplication::with('user')->findOrFail($id);
        $user = $application->user;

        if (!$user) {
            return response()->json(['message' => 'Application user not found.'], 404);
        }

        $user->update([
            'role_id' => $consumerRole->id,
        ]);

        $application->update([
            'status' => 'rejected',
            'review_notes' => (string) $request->input('notes', ''),
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $wholesalerRoleId = Role::where('name', 'WHOLESALER')->value('id');
        return response()->json([
            'message' => 'Wholesaler application rejected',
            'application' => $this->toWholesalerApplication($application->fresh('user'), $wholesalerRoleId),
        ]);
    }

    public function inviteWholesaler(Request $request, WholesalerInvitationService $invitationService)
    {
        // Admin-only
        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Validate request
        $validated = $request->validate([
            'email' => 'required|email',
            'name' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            $invitation = $invitationService->sendInvitation(
                $validated['email'],
                $request->user(),
                $validated['name'] ?? null,
                $validated['company_name'] ?? null,
                $validated['notes'] ?? null
            );

            return response()->json([
                'message' => 'Invitation sent successfully',
                'invitation' => [
                    'id' => $invitation->id,
                    'email' => $invitation->email,
                    'name' => $invitation->name,
                    'company_name' => $invitation->company_name,
                    'sent_at' => $invitation->sent_at,
                    'expires_at' => $invitation->expires_at,
                    'status' => $invitation->accepted_at ? 'accepted' : ($invitation->isSent() ? 'sent' : 'pending'),
                ],
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Failed to invite wholesaler', [
                'email' => $validated['email'],
                'error' => $e->getMessage(),
            ]);

            // Return 409 Conflict if user already exists
            $statusCode = str_contains($e->getMessage(), 'already exists') ? 409 : 500;
            
            return response()->json([
                'error' => 'Failed to send invitation',
                'message' => config('app.debug') ? $e->getMessage() : 'Please contact support',
            ], $statusCode);
        }
    }

    public function show($id)
    {
        $user = User::with('role', 'orders', 'warranties')->findOrFail($id);
        return response()->json($user);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|unique:users,phone',
            'role_id' => 'nullable|integer|exists:roles,id',
            'password' => 'required|string|min:6',
        ]);

        $requestUser = $request->user();
        $isAdmin = strtoupper((string) $requestUser?->role) === 'ADMIN';
        $consumerRole = Role::where('name', 'CONSUMER')->first();

        if (!$consumerRole) {
            return response()->json([
                'message' => 'Default consumer role is not configured.'
            ], 500);
        }

        if (!$isAdmin) {
            $validated['role_id'] = $consumerRole->id;
        } elseif (empty($validated['role_id'])) {
            $validated['role_id'] = $consumerRole->id;
        }

        // Admin-created users are treated as email verified and active by default.
        $validated['is_verified'] = true;
        $validated['email_verified_at'] = now();
        $validated['is_active'] = true;

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);
        return response()->json(['message' => 'User created successfully', 'user' => $user], 201);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|unique:users,phone,' . $user->id,
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
        $user->update([
            'is_verified' => true,
            'email_verified_at' => now(),
        ]);
        return response()->json(['message' => 'User verified successfully']);
    }

    public function toggleActive(User $user)
    {
        $requestUser = request()->user();
        if (!$this->isAdmin($requestUser)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $user->update([
            'is_active' => !$user->is_active,
        ]);

        return response()->json([
            'message' => $user->is_active ? 'User activated successfully' : 'User deactivated successfully',
            'user' => $user,
        ]);
    }
}
