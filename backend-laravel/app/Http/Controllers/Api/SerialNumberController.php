<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SerialNumber;
use Illuminate\Http\Request;

class SerialNumberController extends Controller
{
    public function index()
    {
        $serials = SerialNumber::with('batteryModel')->paginate(20);
        return response()->json($serials);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'battery_model_id' => 'required|integer|exists:battery_models,id',
            'serial_number' => 'required|string|unique:serial_numbers',
            'status' => 'in:unallocated,allocated,sold',
        ]);

        $serial = SerialNumber::create($validated);
        return response()->json(['message' => 'Serial number created successfully', 'serial' => $serial], 201);
    }

    public function show($id)
    {
        $serial = SerialNumber::with('batteryModel')->findOrFail($id);
        return response()->json($serial);
    }

    public function update(Request $request, SerialNumber $serial)
    {
        $validated = $request->validate([
            'battery_model_id' => 'nullable|integer|exists:battery_models,id',
            'serial_number' => 'nullable|string|unique:serial_numbers,serial_number,' . $serial->id,
            'status' => 'nullable|in:unallocated,allocated,sold',
        ]);

        $serial->update($validated);
        return response()->json(['message' => 'Serial number updated successfully', 'serial' => $serial]);
    }

    public function allocate(Request $request, SerialNumber $serial)
    {
        $request->validate(['allocated_to' => 'required|integer|exists:users,id']);

        $serial->update([
            'allocated_to' => $request->allocated_to,
            'allocated_date' => now(),
            'status' => 'allocated',
        ]);

        return response()->json(['message' => 'Serial allocated successfully', 'serial' => $serial]);
    }

    public function markSold(Request $request, SerialNumber $serial)
    {
        $request->validate(['sold_to' => 'required|integer|exists:users,id']);

        $serial->update([
            'sold_to' => $request->sold_to,
            'sold_date' => now(),
            'status' => 'sold',
        ]);

        return response()->json(['message' => 'Serial marked as sold', 'serial' => $serial]);
    }

    public function destroy(SerialNumber $serial)
    {
        $serial->delete();
        return response()->json(['message' => 'Serial number deleted successfully']);
    }
}
