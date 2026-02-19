<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WarrantyClaim;
use Illuminate\Http\Request;

class WarrantyClaimController extends Controller
{
    public function index()
    {
        $claims = WarrantyClaim::with('warranty', 'user', 'attachments')->paginate(10);
        return response()->json($claims);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'warranty_id' => 'required|integer|exists:warranties,id',
            'user_id' => 'required|integer|exists:users,id',
            'claim_number' => 'required|string|unique:warranty_claims',
            'complaint_description' => 'required|string',
            'status' => 'in:submitted,under_review,approved,rejected,resolved',
        ]);

        $claim = WarrantyClaim::create($validated);
        return response()->json(['message' => 'Claim created successfully', 'claim' => $claim], 201);
    }

    public function show(WarrantyClaim $claim)
    {
        return response()->json($claim->load('warranty', 'user', 'attachments'));
    }

    public function update(Request $request, WarrantyClaim $claim)
    {
        $validated = $request->validate([
            'status' => 'nullable|in:submitted,under_review,approved,rejected,resolved',
            'resolution' => 'nullable|string',
        ]);

        $data = $validated;
        if ($request->filled('status') && $request->status === 'resolved') {
            $data['resolved_date'] = now();
        }

        $claim->update($data);
        return response()->json(['message' => 'Claim updated successfully', 'claim' => $claim]);
    }

    public function destroy(WarrantyClaim $claim)
    {
        $claim->delete();
        return response()->json(['message' => 'Claim deleted successfully']);
    }

    public function claimsByWarranty($warrantyId)
    {
        $claims = WarrantyClaim::where('warranty_id', $warrantyId)->with('attachments')->paginate(10);
        return response()->json($claims);
    }
}
