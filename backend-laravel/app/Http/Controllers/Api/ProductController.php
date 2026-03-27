<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    private const PRODUCT_TYPES = ['BATTERY', 'ACCESSORY', 'PART', 'CONSUMABLE', 'SERVICE', 'GENERIC'];

    public function index()
    {
        $products = Product::with('category')->paginate(15);
        return response()->json($products);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'product_type' => 'nullable|string|in:BATTERY,ACCESSORY,PART,CONSUMABLE,SERVICE,GENERIC',
            'sku' => 'required|string|max:100|unique:products,sku',
            'category_id' => 'nullable|integer|exists:product_categories,id',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'total_quantity' => 'required|integer|min:0',
            'available_quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'metadata' => 'nullable|array',
            'is_active' => 'boolean',
            'is_serialized' => 'nullable|boolean',
            'is_warranty_eligible' => 'nullable|boolean',
            'is_fitment_eligible' => 'nullable|boolean',
            'default_warranty_months' => 'nullable|integer|min:0',
        ]);

        if (($validated['available_quantity'] ?? 0) > ($validated['total_quantity'] ?? 0)) {
            return response()->json([
                'message' => 'available_quantity cannot be greater than total_quantity.'
            ], 422);
        }

        $validated = $this->normalizeCapabilities($validated);

        $product = Product::create($validated);
        return response()->json(['message' => 'Product created successfully', 'product' => $product], 201);
    }

    public function show(Product $product)
    {
        return response()->json($product->load('category'));
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:200',
            'product_type' => 'nullable|string|in:BATTERY,ACCESSORY,PART,CONSUMABLE,SERVICE,GENERIC',
            'sku' => 'nullable|string|max:100|unique:products,sku,' . $product->id,
            'category_id' => 'nullable|integer|exists:product_categories,id',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'total_quantity' => 'nullable|integer|min:0',
            'available_quantity' => 'nullable|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'metadata' => 'nullable|array',
            'is_active' => 'boolean',
            'is_serialized' => 'nullable|boolean',
            'is_warranty_eligible' => 'nullable|boolean',
            'is_fitment_eligible' => 'nullable|boolean',
            'default_warranty_months' => 'nullable|integer|min:0',
        ]);

        $candidateTotal = $validated['total_quantity'] ?? $product->total_quantity;
        $candidateAvailable = $validated['available_quantity'] ?? $product->available_quantity;
        if ($candidateAvailable > $candidateTotal) {
            return response()->json([
                'message' => 'available_quantity cannot be greater than total_quantity.'
            ], 422);
        }

        $merged = array_merge($product->toArray(), $validated);
        $validated = $this->normalizeCapabilities($merged, true, $validated);

        $product->update($validated);
        return response()->json(['message' => 'Product updated successfully', 'product' => $product]);
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(['message' => 'Product deleted successfully']);
    }

    private function normalizeCapabilities(array $payload, bool $forUpdate = false, array $changedOnly = []): array
    {
        $type = strtoupper((string) ($payload['product_type'] ?? 'GENERIC'));
        if (!in_array($type, self::PRODUCT_TYPES, true)) {
            $type = 'GENERIC';
        }

        $capabilityByType = [
            'BATTERY' => ['is_serialized' => true, 'is_warranty_eligible' => true, 'is_fitment_eligible' => true],
            'ACCESSORY' => ['is_serialized' => false, 'is_warranty_eligible' => false, 'is_fitment_eligible' => false],
            'PART' => ['is_serialized' => false, 'is_warranty_eligible' => false, 'is_fitment_eligible' => true],
            'CONSUMABLE' => ['is_serialized' => false, 'is_warranty_eligible' => false, 'is_fitment_eligible' => false],
            'SERVICE' => ['is_serialized' => false, 'is_warranty_eligible' => false, 'is_fitment_eligible' => false],
            'GENERIC' => ['is_serialized' => false, 'is_warranty_eligible' => false, 'is_fitment_eligible' => false],
        ];

        $normalized = $forUpdate ? $changedOnly : $payload;
        $normalized['product_type'] = $type;

        foreach ($capabilityByType[$type] as $field => $value) {
            $normalized[$field] = $value;
        }

        if ($type === 'BATTERY') {
            $months = $payload['default_warranty_months'] ?? null;
            if ($months === null) {
                $months = 24;
            }
            $normalized['default_warranty_months'] = (int) $months;
        } else {
            $normalized['default_warranty_months'] = $payload['default_warranty_months'] ?? null;
        }

        return $normalized;
    }
}
