<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BatteryModel;
use Illuminate\Http\Request;

class BatteryModelController extends Controller
{
    public function publicIndex(Request $request)
    {
        $query = BatteryModel::query()->where('status', 'active');

        if ($request->filled('q')) {
            $q = trim((string) $request->query('q'));
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', '%' . $q . '%')
                    ->orWhere('sku', 'like', '%' . $q . '%')
                    ->orWhere('model_code', 'like', '%' . $q . '%')
                    ->orWhere('series', 'like', '%' . $q . '%')
                    ->orWhere('application_segment', 'like', '%' . $q . '%');
            });
        }

        $models = $query
            ->orderBy('name')
            ->paginate((int) $request->query('per_page', 24));

        return response()->json($models);
    }

    public function index(Request $request)
    {
        $query = BatteryModel::query();

        if ($request->filled('q')) {
            $q = trim((string) $request->query('q'));
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', '%' . $q . '%')
                    ->orWhere('sku', 'like', '%' . $q . '%')
                    ->orWhere('brand', 'like', '%' . $q . '%')
                    ->orWhere('model_code', 'like', '%' . $q . '%')
                    ->orWhere('series', 'like', '%' . $q . '%')
                    ->orWhere('application_segment', 'like', '%' . $q . '%');
            });
        }

        $allowedOrderFields = ['created_at', 'name', 'sku', 'price', 'available_quantity'];
        $ordering = (string) $request->query('ordering', '-created_at');
        $direction = str_starts_with($ordering, '-') ? 'desc' : 'asc';
        $field = ltrim($ordering, '-');

        if (!in_array($field, $allowedOrderFields, true)) {
            $field = 'created_at';
            $direction = 'desc';
        }

        $perPage = (int) $request->query('per_page', 15);
        if ($perPage <= 0) {
            $perPage = 15;
        }
        if ($perPage > 100) {
            $perPage = 100;
        }

        $batteries = $query
            ->orderBy($field, $direction)
            ->paginate($perPage);

        return response()->json($batteries);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'brand' => 'nullable|string|max:120',
            'series' => 'nullable|string|max:120',
            'description' => 'nullable|string',
            'image_url' => 'nullable|url|max:500',
            'sku' => 'required|string|unique:battery_models',
            'model_code' => 'nullable|string|max:120',
            'group_size' => 'nullable|string|max:120',
            'voltage' => 'required|numeric',
            'capacity' => 'required|numeric',
            'chemistry' => 'nullable|string|max:120',
            'battery_type' => 'nullable|string|max:120',
            'cca' => 'nullable|integer|min:0',
            'reserve_capacity' => 'nullable|integer|min:0',
            'capacity_ah' => 'nullable|numeric|min:0',
            'length_mm' => 'nullable|numeric|min:0',
            'width_mm' => 'nullable|numeric|min:0',
            'height_mm' => 'nullable|numeric|min:0',
            'total_height_mm' => 'nullable|numeric|min:0',
            'terminal_type' => 'nullable|string|max:40',
            'terminal_layout' => 'nullable|string|max:40',
            'hold_down' => 'nullable|string|max:80',
            'vent_type' => 'nullable|string|max:40',
            'maintenance_free' => 'nullable|boolean',
            'private_warranty_months' => 'nullable|integer|min:0',
            'commercial_warranty_months' => 'nullable|integer|min:0',
            'unit_weight_kg' => 'nullable|numeric|min:0',
            'datasheet_url' => 'nullable|url|max:500',
            'application_segment' => 'nullable|string|max:180',
            'specs' => 'nullable|array',
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
            'brand' => 'nullable|string|max:120',
            'series' => 'nullable|string|max:120',
            'description' => 'nullable|string',
            'image_url' => 'nullable|url|max:500',
            'sku' => 'nullable|string|unique:battery_models,sku,' . $battery->id,
            'model_code' => 'nullable|string|max:120',
            'group_size' => 'nullable|string|max:120',
            'voltage' => 'nullable|numeric',
            'capacity' => 'nullable|numeric',
            'chemistry' => 'nullable|string|max:120',
            'battery_type' => 'nullable|string|max:120',
            'cca' => 'nullable|integer|min:0',
            'reserve_capacity' => 'nullable|integer|min:0',
            'capacity_ah' => 'nullable|numeric|min:0',
            'length_mm' => 'nullable|numeric|min:0',
            'width_mm' => 'nullable|numeric|min:0',
            'height_mm' => 'nullable|numeric|min:0',
            'total_height_mm' => 'nullable|numeric|min:0',
            'terminal_type' => 'nullable|string|max:40',
            'terminal_layout' => 'nullable|string|max:40',
            'hold_down' => 'nullable|string|max:80',
            'vent_type' => 'nullable|string|max:40',
            'maintenance_free' => 'nullable|boolean',
            'private_warranty_months' => 'nullable|integer|min:0',
            'commercial_warranty_months' => 'nullable|integer|min:0',
            'unit_weight_kg' => 'nullable|numeric|min:0',
            'datasheet_url' => 'nullable|url|max:500',
            'application_segment' => 'nullable|string|max:180',
            'specs' => 'nullable|array',
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
