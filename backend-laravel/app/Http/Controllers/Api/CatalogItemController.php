<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CatalogItem;
use App\Models\CatalogItemAuditLog;
use App\Models\CatalogVariation;
use App\Services\EntityAccessService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

/**
 * Unified Catalog Item Controller
 * 
 * Single source of truth for all catalog operations (batteries, accessories, parts, services, etc.)
 * Replaces legacy BatteryModelController, ProductController, and AccessoryController
 */
class CatalogItemController extends Controller
{
    private EntityAccessService $accessService;

    public function __construct()
    {
        $this->accessService = new EntityAccessService();
    }

    /**
     * POST /inventory/catalog/summary
     * Get overview of catalog
     */
    public function summary()
    {
        $user = auth()->user();

        $query = CatalogItem::query()
            ->visibleToUser($user)
            ->active();

        $summary = [
            'total_items' => $query->count(),
            'total_quantity' => $query->sum('available_quantity'),
            'total_value' => $query->sum(DB::raw('available_quantity * price')),
            'by_type' => CatalogItem::select('type')
                ->selectRaw('COUNT(*) as count')
                ->selectRaw('SUM(available_quantity) as total_available')
                ->selectRaw('SUM(available_quantity * price) as total_value')
                ->visibleToUser($user)
                ->groupBy('type')
                ->get()
                ->map(fn ($row) => [
                    'type' => $row->type,
                    'count' => $row->count,
                    'available_quantity' => $row->total_available,
                    'value' => $row->total_value,
                ])
                ->keyBy('type'),
            'low_stock_items' => CatalogItem::lowStock()
                ->visibleToUser($user)
                ->count(),
            'out_of_stock_items' => CatalogItem::where('available_quantity', 0)
                ->visibleToUser($user)
                ->count(),
        ];

        return response()->json($summary);
    }

    public function index(Request $request)
    {
        $query = CatalogItem::query()
            ->with(['categories', 'variations'])
            ->visibleToUser(auth()->user());

        // Filter by type
        if ($request->filled('type')) {
            $types = is_array($request->type) 
                ? $request->type 
                : [$request->type];
            $query->ofTypes($types);
        }

        // Filter by category
        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }

        // Search
        if ($request->filled('q')) {
            $term = trim((string) $request->query('q'));
            $query->search($term);
        }

        // Filter by stock status
        if ($request->filled('in_stock')) {
            if ($request->boolean('in_stock')) {
                $query->inStock();
            }
        }

        // Filter by low stock
        if ($request->boolean('low_stock')) {
            $query->lowStock();
        }

        // Filter active only
        if ($request->boolean('active_only', true)) {
            $query->active();
        }

        // Sorting
        $sortBy = $request->input('sort', '-updated_at');
        $sortParts = explode(',', $sortBy);
        foreach ($sortParts as $part) {
            $desc = Str::startsWith($part, '-');
            $field = ltrim($part, '-');
            $query->orderBy($field, $desc ? 'desc' : 'asc');
        }

        // Pagination
        $perPage = $request->integer('per_page', 20);
        $perPage = min($perPage, 100);
        $page = $request->integer('page', 1);

        $items = $query->paginate($perPage, ['*'], 'page', $page);

        // Transform items
        $transformed = $items->map(fn (CatalogItem $item) => $this->transformItem($item));

        return response()->json([
            'data' => $transformed,
            'pagination' => [
                'current_page' => $items->currentPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
                'last_page' => $items->lastPage(),
            ],
        ]);
    }

    public function show(CatalogItem $item)
    {
        $user = auth()->user();

        // Permission check
        $canView = $user
            ? CatalogItem::query()->whereKey($item->id)->visibleToUser($user)->exists()
            : false;

        if (!$canView) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $item->load(['categories', 'variations', 'serialNumbers' => function ($q) {
            $q->limit(10);
        }]);

        return response()->json([
            'data' => $this->transformItemDetailed($item),
        ]);
    }

    public function publicShow($id)
    {
        $item = CatalogItem::where('id', $id)
            ->orWhere('slug', $id)
            ->published()
            ->active()
            ->with(['categories'])
            ->firstOrFail();

        return response()->json([
            'data' => $this->transformItemPublic($item),
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        // Permission check
        if (!$user || !$this->accessService->hasPermission($user, 'INVENTORY', 'CREATE')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'type' => 'required|in:BATTERY,ACCESSORY,PART,CONSUMABLE,SERVICE,GENERIC',
            'name' => 'required|string|max:255',
            'sku' => 'required|unique:catalog_items|string|max:100',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
            'is_serialized' => 'boolean',
            'is_warranty_eligible' => 'boolean',
            'is_fitment_eligible' => 'boolean',
            'default_warranty_months' => 'nullable|integer|min:0',
            'private_warranty_months' => 'nullable|integer|min:0',
            'commercial_warranty_months' => 'nullable|integer|min:0',
            'voltage_nominal' => 'nullable|numeric',
            'capacity_ah' => 'nullable|numeric',
            'capacity_wh' => 'nullable|numeric',
            'chemistry' => 'nullable|string',
            'cca' => 'nullable|integer',
            'brand' => 'nullable|string',
            'series' => 'nullable|string',
            'model_code' => 'nullable|string',
            'primary_category_id' => 'nullable|exists:catalog_categories,id',
        ]);

        // Normalize capabilities
        $validated = $this->normalizeCapabilities($validated);

        // Create item
        $item = CatalogItem::create($validated);

        // Assign category
        if ($request->filled('primary_category_id')) {
            $item->categories()->attach($request->primary_category_id, ['is_primary' => true]);
        }

        // Log creation
        CatalogItemAuditLog::logChange($item, 'CREATE', auth()->user());

        return response()->json([
            'data' => $this->transformItem($item),
            'message' => 'Item created successfully',
        ], 201);
    }

    public function update(Request $request, CatalogItem $item)
    {
        $user = auth()->user();

        // Permission check
        if (!$user || !$this->accessService->hasPermission($user, 'INVENTORY', 'UPDATE')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'cost_price' => 'sometimes|nullable|numeric|min:0',
            'total_quantity' => 'sometimes|integer|min:0',
            'available_quantity' => 'sometimes|integer|min:0',
            'low_stock_threshold' => 'sometimes|integer|min:0',
            'is_active' => 'sometimes|boolean',
            'is_warranty_eligible' => 'sometimes|boolean',
            'default_warranty_months' => 'sometimes|nullable|integer|min:0',
            'voltage_nominal' => 'sometimes|nullable|numeric',
            'capacity_ah' => 'sometimes|nullable|numeric',
            'chemistry' => 'sometimes|nullable|string',
            'primary_category_id' => 'sometimes|nullable|exists:catalog_categories,id',
        ]);

        $changed = array_keys($validated);

        // Normalize capabilities
        if (isset($validated['is_active'])) {
            $validated = $this->normalizeCapabilities($validated, $item);
        }

        // Update
        $item->update($validated);

        // Update category
        if ($request->filled('primary_category_id')) {
            $item->categories()->detach();
            $item->categories()->attach($request->primary_category_id, ['is_primary' => true]);
        }

        // Log changes
        foreach ($changed as $field) {
            CatalogItemAuditLog::logChange(
                $item,
                'UPDATE',
                auth()->user(),
                $field,
                $item->getOriginal($field),
                $item->getAttribute($field)
            );
        }

        return response()->json([
            'data' => $this->transformItem($item),
            'message' => 'Item updated successfully',
        ]);
    }

    public function destroy(CatalogItem $item)
    {
        $user = auth()->user();
        if (!$user || !$this->accessService->hasPermission($user, 'INVENTORY', 'DELETE')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Prevent deletion if item has active orders
        if ($item->orderItems()->whereHas('order', fn ($q) => $q->where('status', '!=', 'cancelled'))->exists()) {
            return response()->json([
                'message' => 'Cannot delete item with active orders',
            ], 422);
        }

        $item->delete();

        CatalogItemAuditLog::logChange($item, 'DELETE', auth()->user());

        return response()->json(['message' => 'Item deleted successfully']);
    }

    public function publish(CatalogItem $item)
    {
        $user = auth()->user();
        if (!$user || !$this->accessService->hasPermission($user, 'INVENTORY', 'UPDATE')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $item->publish();

        CatalogItemAuditLog::logChange($item, 'PUBLISH', auth()->user());

        return response()->json([
            'data' => $this->transformItem($item),
            'message' => 'Item published',
        ]);
    }

    public function discontinue(CatalogItem $item)
    {
        $user = auth()->user();
        if (!$user || !$this->accessService->hasPermission($user, 'INVENTORY', 'UPDATE')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $item->discontinue();

        CatalogItemAuditLog::logChange($item, 'DISCONTINUE', auth()->user());

        return response()->json([
            'data' => $this->transformItem($item),
            'message' => 'Item discontinued',
        ]);
    }

    // ========== Transformation Methods ==========

    private function transformItem(CatalogItem $item): array
    {
        $base = [
            'id' => $item->id,
            'type' => $item->type,
            'name' => $item->name,
            'sku' => $item->sku,
            'slug' => $item->slug,
            'description' => $item->description,
            'price' => round($item->price, 2),
            'cost_price' => round($item->cost_price ?? 0, 2),
            'availability' => [
                'total' => $item->total_quantity,
                'available' => $item->available_quantity,
                'reserved' => $item->reserved_quantity,
                'status' => $item->stock_status,
            ],
            'capabilities' => $item->capabilities,
            'warranty' => [
                'eligible' => $item->is_warranty_eligible,
                'default_months' => $item->default_warranty_months,
                'label' => $item->warranty_label,
            ],
            'categories' => $item->categories->map(fn ($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'is_primary' => $cat->pivot->is_primary ?? false,
            ]),
            'brand' => $item->brand,
            'model_code' => $item->model_code,
            'image_url' => $item->image_url,
            'is_active' => $item->is_active,
            'status' => $item->is_active ? 'active' : 'inactive',
            'created_at' => $item->created_at?->toIso8601String(),
            'updated_at' => $item->updated_at?->toIso8601String(),
        ];

        // Add type-specific specifications
        if ($item->isBattery()) {
            $base['specifications'] = [
                'voltage' => $item->voltage_nominal,
                'capacity_ah' => $item->capacity_ah,
                'capacity_wh' => $item->capacity_wh,
                'chemistry' => $item->chemistry,
                'cca' => $item->cca,
                'cycle_life' => $item->cycle_life,
                'bms_included' => $item->bms_included,
            ];
        }

        return $base;
    }

    private function transformItemDetailed(CatalogItem $item): array
    {
        $base = $this->transformItem($item);

        $base['details'] = [
            'published_at' => $item->published_at?->toIso8601String(),
            'discontinued_at' => $item->discontinued_at?->toIso8601String(),
            'physical' => [
                'weight_kg' => $item->unit_weight_kg,
                'dimensions' => [
                    'length_mm' => $item->length_mm,
                    'width_mm' => $item->width_mm,
                    'height_mm' => $item->height_mm,
                ],
            ],
            'documentation' => [
                'datasheet_url' => $item->datasheet_url,
                'user_manual_url' => $item->user_manual_url,
                'application_segment' => $item->application_segment,
            ],
        ];

        if ($item->variations->count() > 0) {
            $base['variations'] = $item->variations->map(fn (CatalogVariation $v) => [
                'id' => $v->id,
                'name' => $v->display_name,
                'sku' => $v->full_sku,
                'price' => $v->effective_price,
                'capacity_ah' => $v->capacity_ah,
                'available' => $v->available_quantity,
            ]);
        }

        return $base;
    }

    private function transformItemPublic(CatalogItem $item): array
    {
        return [
            'id' => $item->id,
            'name' => $item->name,
            'sku' => $item->sku,
            'price' => round($item->price, 2),
            'image_url' => $item->image_url,
            'available' => $item->available_quantity > 0,
            'category' => $item->primaryCategory?->first()?->name,
            'brand' => $item->brand,
            'type' => $item->type,
        ];
    }

    private function normalizeCapabilities(array $data, ?CatalogItem $existing = null): array
    {
        $type = strtoupper($data['type'] ?? $existing?->type ?? 'GENERIC');

        // Define capabilities per type
        $typeCapabilities = [
            'BATTERY' => [
                'is_serialized' => true,
                'is_warranty_eligible' => true,
                'is_fitment_eligible' => false,
            ],
            'ACCESSORY' => [
                'is_serialized' => false,
                'is_warranty_eligible' => false,
                'is_fitment_eligible' => true,
            ],
            'PART' => [
                'is_serialized' => false,
                'is_warranty_eligible' => false,
                'is_fitment_eligible' => true,
            ],
            'CONSUMABLE' => [
                'is_serialized' => false,
                'is_warranty_eligible' => false,
                'is_fitment_eligible' => false,
            ],
            'SERVICE' => [
                'is_serialized' => false,
                'is_warranty_eligible' => false,
                'is_fitment_eligible' => false,
            ],
        ];

        // Apply defaults
        $defaults = $typeCapabilities[$type] ?? [];
        foreach ($defaults as $field => $value) {
            if (!isset($data[$field])) {
                $data[$field] = $value;
            }
        }

        return $data;
    }
}
