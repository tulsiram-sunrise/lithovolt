<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Accessory;
use Illuminate\Http\Request;

class AccessoryController extends Controller
{
    public function index()
    {
        $accessories = Accessory::paginate(15);
        return response()->json($accessories);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sku' => 'required|string|unique:accessories',
            'total_quantity' => 'required|integer|min:0',
            'available_quantity' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'status' => 'in:active,inactive',
        ]);

        $accessory = Accessory::create($validated);
        return response()->json(['message' => 'Accessory created successfully', 'accessory' => $accessory], 201);
    }

    public function show(Accessory $accessory)
    {
        return response()->json($accessory);
    }

    public function update(Request $request, Accessory $accessory)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'total_quantity' => 'nullable|integer|min:0',
            'available_quantity' => 'nullable|integer|min:0',
            'price' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:active,inactive',
        ]);

        $accessory->update($validated);
        return response()->json(['message' => 'Accessory updated successfully', 'accessory' => $accessory]);
    }

    public function destroy(Accessory $accessory)
    {
        $accessory->delete();
        return response()->json(['message' => 'Accessory deleted successfully']);
    }
}
