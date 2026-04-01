<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Warranty;
use App\Models\WarrantyClaim;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class WarrantyClaimController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:jwt');
    }

    public function index()
    {
        $user = auth()->user();
        $claims = WarrantyClaim::with('warranty', 'user', 'attachments')
            ->visibleToUser($user)
            ->paginate(10);
        return response()->json($claims);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'warranty_id' => 'required|integer|exists:warranties,id',
            'user_id' => 'required|integer|exists:users,id',
            'claim_number' => 'required|string|unique:warranty_claims',
            'complaint_description' => 'required|string',
            'status' => [
                'nullable',
                'string',
                Rule::in(['pending', 'under_review', 'approved', 'rejected', 'resolved', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RESOLVED']),
            ],
        ]);

        $actor = $request->user();
        $warranty = Warranty::findOrFail($validated['warranty_id']);

        // Keep claim ownership consistent with the parent warranty.
        if ((int) $validated['user_id'] !== (int) $warranty->user_id) {
            return response()->json([
                'message' => 'Claim user must match the warranty owner.',
            ], 422);
        }

        if (!$this->isPrivileged($actor)) {
            if ((int) $validated['user_id'] !== (int) $actor->id) {
                return response()->json([
                    'message' => 'You can only create claims for your own account.',
                ], 403);
            }

            if ((int) $warranty->user_id !== (int) $actor->id) {
                return response()->json([
                    'message' => 'You can only create claims for your own warranties.',
                ], 403);
            }
        }

        $validated['status'] = $this->normalizeStatus($validated['status'] ?? WarrantyClaim::STATUS_PENDING);

        $claim = WarrantyClaim::create($validated);
        return response()->json(['message' => 'Claim created successfully', 'claim' => $claim], 201);
    }

    public function show(Request $request, WarrantyClaim $claim)
    {
        if (!$this->canAccessClaim($request->user(), $claim)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($claim->load('warranty', 'user', 'attachments'));
    }

    public function update(Request $request, WarrantyClaim $claim)
    {
        if (!$this->canAccessClaim($request->user(), $claim)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'status' => [
                'nullable',
                'string',
                Rule::in(['pending', 'under_review', 'approved', 'rejected', 'resolved', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RESOLVED']),
            ],
            'resolution' => 'nullable|string',
        ]);

        $nextStatus = null;
        if ($request->filled('status')) {
            $nextStatus = $this->normalizeStatus($validated['status']);
        }

        try {
            if ($nextStatus && strtoupper((string) $claim->status) !== $nextStatus) {
                $claim->updateStatus(
                    $nextStatus,
                    $request->user(),
                    (string) ($validated['resolution'] ?? '')
                );
            } elseif (array_key_exists('resolution', $validated)) {
                $claim->update([
                    'resolution' => $validated['resolution'],
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Claim updated successfully',
            'claim' => $claim->fresh()->load('warranty', 'user', 'attachments'),
        ]);
    }

    public function destroy(Request $request, WarrantyClaim $claim)
    {
        if (!$this->canAccessClaim($request->user(), $claim)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $claim->delete();
        return response()->json(['message' => 'Claim deleted successfully']);
    }

    public function claimsByWarranty(Request $request, $warrantyId)
    {
        $actor = $request->user();

        $claimsQuery = WarrantyClaim::where('warranty_id', $warrantyId)
            ->with('attachments');

        if (!$this->isPrivileged($actor)) {
            $claimsQuery->where(function ($query) use ($actor) {
                $query->where('user_id', $actor->id)
                    ->orWhereHas('warranty', fn ($warrantyQuery) => $warrantyQuery->where('user_id', $actor->id));
            });
        }

        $claims = $claimsQuery->paginate(10);
        return response()->json($claims);
    }

    private function normalizeStatus(string $status): string
    {
        return strtoupper(trim($status));
    }

    private function isPrivileged(?User $user): bool
    {
        if (!$user) {
            return false;
        }

        return $user->hasRole('ADMIN');
    }

    private function canAccessClaim(?User $user, WarrantyClaim $claim): bool
    {
        if (!$user) {
            return false;
        }

        if ($this->isPrivileged($user)) {
            return true;
        }

        return (int) $claim->user_id === (int) $user->id
            || (int) optional($claim->warranty)->user_id === (int) $user->id;
    }
}
