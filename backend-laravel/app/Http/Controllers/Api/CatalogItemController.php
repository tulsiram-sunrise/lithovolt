<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class CatalogItemController extends Controller
{
    public function summary()
    {
        $base = Product::query();

        return response()->json([
            'total' => (clone $base)->count(),
            'active' => (clone $base)->where('is_active', true)->count(),
            'by_type' => (clone $base)
                ->selectRaw('product_type, COUNT(*) as count')
                ->groupBy('product_type')
                ->pluck('count', 'product_type'),
            'serialized' => (clone $base)->where('is_serialized', true)->count(),
            'warranty_eligible' => (clone $base)->where('is_warranty_eligible', true)->count(),
            'fitment_eligible' => (clone $base)->where('is_fitment_eligible', true)->count(),
        ]);
    }

    public function index(Request $request)
    {
        $query = Product::query()->with(['category', 'legacyBatteryModel', 'legacyAccessory']);

        if ($request->filled('q')) {
            $term = trim((string) $request->query('q'));
            $query->where(function ($sub) use ($term) {
                $sub->where('name', 'like', '%' . $term . '%')
                    ->orWhere('sku', 'like', '%' . $term . '%')
                    ->orWhere('description', 'like', '%' . $term . '%');
            });
        }

        if ($request->filled('type')) {
            $query->where('product_type', strtoupper((string) $request->query('type')));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', (int) $request->query('category_id'));
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $allowedOrderFields = ['created_at', 'name', 'sku', 'price', 'available_quantity'];
        $ordering = (string) $request->query('ordering', '-created_at');
        $direction = str_starts_with($ordering, '-') ? 'desc' : 'asc';
        $field = ltrim($ordering, '-');

        if (!in_array($field, $allowedOrderFields, true)) {
            $field = 'created_at';
            $direction = 'desc';
        }

        $perPage = (int) $request->query('per_page', 20);
        $perPage = max(1, min($perPage, 100));

        $items = $query
            ->orderBy($field, $direction)
            ->paginate($perPage);

        /** @var \Illuminate\Pagination\LengthAwarePaginator $items */
        $items->setCollection(
            $items->getCollection()->map(fn (Product $product) => $this->toCatalogPayload($product))
        );

        return response()->json($items);
    }

    public function show(Product $catalogItem)
    {
        $catalogItem->load(['category', 'legacyBatteryModel', 'legacyAccessory', 'serialNumbers', 'warranties']);
        return response()->json($this->toCatalogPayload($catalogItem, true));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'product_type' => 'required|string|in:BATTERY,ACCESSORY,PART,CONSUMABLE,SERVICE,GENERIC',
            'sku' => 'required|string|max:100|unique:products,sku',
            'category_id' => 'nullable|integer|exists:product_categories,id',
            'description' => 'nullable|string',
            'image_url' => 'nullable|url|max:500',
            'price' => 'required|numeric|min:0',
            'total_quantity' => 'required|integer|min:0',
            'available_quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'default_warranty_months' => 'nullable|integer|min:0',
            'metadata' => 'nullable|array',
            'status' => 'nullable|string|in:active,inactive',
        ]);

        if (($validated['available_quantity'] ?? 0) > ($validated['total_quantity'] ?? 0)) {
            return response()->json(['message' => 'available_quantity cannot be greater than total_quantity.'], 422);
        }

        $prepared = $this->prepareProductPayload($validated, $request->all());
        $product = Product::create($prepared)->load(['category', 'legacyBatteryModel', 'legacyAccessory']);

        return response()->json([
            'message' => 'Catalog item created successfully',
            'item' => $this->toCatalogPayload($product, true),
        ], 201);
    }

    public function update(Request $request, Product $catalogItem)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:200',
            'product_type' => 'nullable|string|in:BATTERY,ACCESSORY,PART,CONSUMABLE,SERVICE,GENERIC',
            'sku' => 'nullable|string|max:100|unique:products,sku,' . $catalogItem->id,
            'category_id' => 'nullable|integer|exists:product_categories,id',
            'description' => 'nullable|string',
            'image_url' => 'nullable|url|max:500',
            'price' => 'nullable|numeric|min:0',
            'total_quantity' => 'nullable|integer|min:0',
            'available_quantity' => 'nullable|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'default_warranty_months' => 'nullable|integer|min:0',
            'metadata' => 'nullable|array',
            'status' => 'nullable|string|in:active,inactive',
        ]);

        $candidateTotal = $validated['total_quantity'] ?? $catalogItem->total_quantity;
        $candidateAvailable = $validated['available_quantity'] ?? $catalogItem->available_quantity;
        if ($candidateAvailable > $candidateTotal) {
            return response()->json(['message' => 'available_quantity cannot be greater than total_quantity.'], 422);
        }

        $prepared = $this->prepareProductPayload(array_merge($catalogItem->toArray(), $validated), $request->all(), $catalogItem);
        $catalogItem->update($prepared);

        return response()->json([
            'message' => 'Catalog item updated successfully',
            'item' => $this->toCatalogPayload($catalogItem->fresh()->load(['category', 'legacyBatteryModel', 'legacyAccessory']), true),
        ]);
    }

    public function destroy(Product $catalogItem)
    {
        $catalogItem->delete();
        return response()->json(['message' => 'Catalog item deleted successfully']);
    }

    private function prepareProductPayload(array $validated, array $raw, ?Product $existing = null): array
    {
        $type = strtoupper((string) ($validated['product_type'] ?? $existing?->product_type ?? 'GENERIC'));
        $metadata = is_array($validated['metadata'] ?? null)
            ? $validated['metadata']
            : (is_array($existing?->metadata) ? $existing->metadata : []);

        $extraBatteryFields = [
            'brand', 'series', 'model_code', 'group_size', 'image_url', 'voltage', 'capacity', 'chemistry',
            'battery_type', 'cca', 'reserve_capacity', 'capacity_ah', 'length_mm', 'width_mm',
            'height_mm', 'total_height_mm', 'terminal_type', 'terminal_layout', 'hold_down',
            'vent_type', 'maintenance_free', 'private_warranty_months', 'commercial_warranty_months',
            'unit_weight_kg', 'datasheet_url', 'application_segment', 'specs', 'warranty_months',
        ];

        foreach ($extraBatteryFields as $field) {
            if (array_key_exists($field, $raw)) {
                $metadata[$field] = $raw[$field];
            }
        }

        if (array_key_exists('status', $validated)) {
            $validated['is_active'] = $validated['status'] === 'active';
            unset($validated['status']);
        }

        $capabilityByType = [
            'BATTERY' => ['is_serialized' => true, 'is_warranty_eligible' => true, 'is_fitment_eligible' => true],
            'ACCESSORY' => ['is_serialized' => false, 'is_warranty_eligible' => false, 'is_fitment_eligible' => false],
            'PART' => ['is_serialized' => false, 'is_warranty_eligible' => false, 'is_fitment_eligible' => true],
            'CONSUMABLE' => ['is_serialized' => false, 'is_warranty_eligible' => false, 'is_fitment_eligible' => false],
            'SERVICE' => ['is_serialized' => false, 'is_warranty_eligible' => false, 'is_fitment_eligible' => false],
            'GENERIC' => ['is_serialized' => false, 'is_warranty_eligible' => false, 'is_fitment_eligible' => false],
        ];

        $prepared = [
            'name' => $validated['name'],
            'product_type' => $type,
            'sku' => $validated['sku'],
            'category_id' => $validated['category_id'] ?? null,
            'description' => $validated['description'] ?? null,
            'image_url' => $validated['image_url'] ?? ($existing?->image_url ?? data_get($metadata, 'image_url')),
            'price' => $validated['price'] ?? 0,
            'total_quantity' => $validated['total_quantity'] ?? 0,
            'available_quantity' => $validated['available_quantity'] ?? 0,
            'low_stock_threshold' => $validated['low_stock_threshold'] ?? ($existing?->low_stock_threshold ?? 5),
            'is_active' => $validated['is_active'] ?? ($existing?->is_active ?? true),
            'default_warranty_months' => $validated['default_warranty_months'] ?? ($metadata['warranty_months'] ?? $existing?->default_warranty_months),
            'metadata' => $metadata,
        ];

        foreach ($capabilityByType[$type] as $field => $value) {
            $prepared[$field] = $value;
        }

        if ($type !== 'BATTERY') {
            $prepared['default_warranty_months'] = $validated['default_warranty_months'] ?? $existing?->default_warranty_months;
        }

        return $prepared;
    }

    private function toCatalogPayload(Product $product, bool $includeRelations = false): array
    {
        $metadata = is_array($product->metadata) ? $product->metadata : [];
        $legacyBattery = $product->legacyBatteryModel;
        $legacyAccessory = $product->legacyAccessory;

        $warrantyMonths = $product->default_warranty_months
            ?? data_get($metadata, 'warranty_months')
            ?? data_get($metadata, 'private_warranty_months')
            ?? 0;

        $payload = [
            'id' => $product->id,
            'catalog_id' => $product->id,
            'name' => $product->name,
            'sku' => $product->sku,
            'category_name' => $product->category?->name,
            'description' => $product->description,
            'image_url' => $product->image_url ?? data_get($metadata, 'image_url'),
            'price' => $product->price,
            'total_quantity' => $product->total_quantity,
            'available_quantity' => $product->available_quantity,
            'status' => $product->is_active ? 'active' : 'inactive',
            'is_active' => $product->is_active,
            'product_type' => $product->product_type,
            'warranty_months' => (int) $warrantyMonths,
            'default_warranty_months' => $product->default_warranty_months,
            'brand' => data_get($metadata, 'brand'),
            'series' => data_get($metadata, 'series'),
            'model_code' => data_get($metadata, 'model_code'),
            'chemistry' => data_get($metadata, 'chemistry'),
            'battery_type' => data_get($metadata, 'battery_type'),
            'capacity' => data_get($metadata, 'capacity'),
            'capacity_ah' => data_get($metadata, 'capacity_ah'),
            'voltage' => data_get($metadata, 'voltage'),
            'legacy_battery_model_id' => $product->legacy_battery_model_id,
            'legacy_accessory_id' => $product->legacy_accessory_id,
            'legacy_ids' => [
                'battery_model_id' => $product->legacy_battery_model_id,
                'accessory_id' => $product->legacy_accessory_id,
            ],
            'capabilities' => [
                'serialized' => (bool) $product->is_serialized,
                'warranty_eligible' => (bool) $product->is_warranty_eligible,
                'fitment_eligible' => (bool) $product->is_fitment_eligible,
            ],
            'created_at' => $product->created_at,
            'updated_at' => $product->updated_at,
        ];

        if ($legacyBattery) {
            $payload['legacy_battery'] = [
                'id' => $legacyBattery->id,
                'sku' => $legacyBattery->sku,
                'status' => $legacyBattery->status,
            ];
        }

        if ($legacyAccessory) {
            $payload['legacy_accessory'] = [
                'id' => $legacyAccessory->id,
                'sku' => $legacyAccessory->sku,
                'status' => $legacyAccessory->status,
            ];
        }

        if ($includeRelations) {
            $payload['category'] = $product->category;
            $payload['serials_count'] = $product->serialNumbers->count();
            $payload['warranties_count'] = $product->warranties->count();
            $payload['metadata'] = $metadata;
        }

        return $payload;
    }
}
