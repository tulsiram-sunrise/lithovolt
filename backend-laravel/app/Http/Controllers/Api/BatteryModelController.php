<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BatteryModel;
use Illuminate\Http\Request;

class BatteryModelController extends Controller
{
    public function index()
    {
        $batteries = BatteryModel::paginate(15);
        return response()->json($batteries);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sku' => 'required|string|unique:battery_models',
            'voltage' => 'required|numeric',
            'capacity' => 'required|numeric',
            'chemistry' => 'required|string',
            'total_quantity' => 'required|integer|min:0',
            'available_quantity' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'warranty_months' => 'required|integer|min:0',
            'status' => 'in:active,inactive',
        ]);

        $battery = BatteryModel::create($validated);
        return response()->json(['message' => 'Battery model created successfully', 'battery' => $battery], 201);
    }

    public function show($id)
    {
        $battery = BatteryModel::with('serialNumbers', 'warranties')->findOrFail($id);
        return response()->json($battery);
    }

    public function update(Request $request, BatteryModel $battery)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'voltage' => 'nullable|numeric',
            'capacity' => 'nullable|numeric',
            'chemistry' => 'nullable|string',
            'total_quantity' => 'nullable|integer|min:0',
            'available_quantity' => 'nullable|integer|min:0',
            'price' => 'nullable|numeric|min:0',
            'warranty_months' => 'nullable|integer|min:0',
            'status' => 'nullable|in:active,inactive',
        ]);

        $battery->update($validated);
        return response()->json(['message' => 'Battery model updated successfully', 'battery' => $battery]);
    }

    public function destroy(BatteryModel $battery)
    {
        $battery->delete();
        return response()->json(['message' => 'Battery model deleted successfully']);
    }
}
