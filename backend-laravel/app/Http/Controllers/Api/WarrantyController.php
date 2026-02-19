<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Warranty;
use Illuminate\Http\Request;

class WarrantyController extends Controller
{
    public function index()
    {
        $warranties = Warranty::with('batteryModel', 'user', 'claims')->paginate(10);
        return response()->json($warranties);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'warranty_number' => 'required|string|unique:warranties',
            'battery_model_id' => 'required|integer|exists:battery_models,id',
            'user_id' => 'required|integer|exists:users,id',
            'serial_number' => 'required|string',
            'issue_date' => 'required|date',
            'expiry_date' => 'required|date|after:issue_date',
            'status' => 'in:active,expired,claimed',
        ]);

        $warranty = Warranty::create($validated);
        return response()->json(['message' => 'Warranty created successfully', 'warranty' => $warranty], 201);
    }

    public function show(Warranty $warranty)
    {
        return response()->json($warranty->load('batteryModel', 'user', 'claims'));
    }

    public function update(Request $request, Warranty $warranty)
    {
        $validated = $request->validate([
            'status' => 'nullable|in:active,expired,claimed',
        ]);

        $warranty->update($validated);
        return response()->json(['message' => 'Warranty updated successfully', 'warranty' => $warranty]);
    }

    public function destroy(Warranty $warranty)
    {
        $warranty->delete();
        return response()->json(['message' => 'Warranty deleted successfully']);
    }

    public function validateQRCode($qrCode)
    {
        $warranty = Warranty::where('qr_code', $qrCode)->first();
        
        if (!$warranty) {
            return response()->json(['valid' => false, 'message' => 'Invalid QR code'], 404);
        }

        return response()->json([
            'valid' => true,
            'warranty' => $warranty->load('batteryModel', 'user'),
            'is_expired' => $warranty->expiry_date->isPast(),
        ]);
    }
}
