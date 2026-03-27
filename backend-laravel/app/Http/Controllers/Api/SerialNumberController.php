<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\SerialNumber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SerialNumberController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $serials = SerialNumber::with('batteryModel', 'product', 'allocatedToUser', 'soldToUser')
            ->visibleToUser($user)
            ->orderByDesc('created_at')
            ->paginate(20);

        $results = collect($serials->items())
            ->map(fn (SerialNumber $serial) => $this->toSerialPayload($serial))
            ->values();

        return response()->json([
            'current_page' => $serials->currentPage(),
            'data' => $results,
            'results' => $results,
            'first_page_url' => $serials->url(1),
            'from' => $serials->firstItem(),
            'last_page' => $serials->lastPage(),
            'last_page_url' => $serials->url($serials->lastPage()),
            'next_page_url' => $serials->nextPageUrl(),
            'path' => $serials->path(),
            'per_page' => $serials->perPage(),
            'prev_page_url' => $serials->previousPageUrl(),
            'to' => $serials->lastItem(),
            'total' => $serials->total(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'battery_model_id' => 'nullable|integer|exists:battery_models,id',
            'product_id' => 'nullable|integer|exists:products,id',
            'serial_number' => 'required|string|unique:serial_numbers',
            'status' => 'in:unallocated,allocated,sold',
        ]);

        if (empty($validated['product_id']) && empty($validated['battery_model_id'])) {
            return response()->json([
                'message' => 'Either product_id or battery_model_id is required.'
            ], 422);
        }

        if (empty($validated['product_id']) && !empty($validated['battery_model_id'])) {
            $validated['product_id'] = \App\Models\Product::where('legacy_battery_model_id', $validated['battery_model_id'])->value('id');
        }

        if (empty($validated['battery_model_id']) && !empty($validated['product_id'])) {
            $validated['battery_model_id'] = \App\Models\Product::whereKey($validated['product_id'])->value('legacy_battery_model_id');
        }

        $serial = SerialNumber::create($validated)->load('batteryModel', 'product', 'allocatedToUser', 'soldToUser');
        return response()->json([
            'message' => 'Serial number created successfully',
            'serial' => $this->toSerialPayload($serial),
        ], 201);
    }

    public function show($id)
    {
        $serial = SerialNumber::with('batteryModel', 'product', 'allocatedToUser', 'soldToUser')->findOrFail($id);
        return response()->json($this->toSerialPayload($serial));
    }

    public function update(Request $request, SerialNumber $serial)
    {
        $validated = $request->validate([
            'battery_model_id' => 'nullable|integer|exists:battery_models,id',
            'product_id' => 'nullable|integer|exists:products,id',
            'serial_number' => 'nullable|string|unique:serial_numbers,serial_number,' . $serial->id,
            'status' => 'nullable|in:unallocated,allocated,sold',
        ]);

        if (array_key_exists('battery_model_id', $validated) && !array_key_exists('product_id', $validated)) {
            $validated['product_id'] = empty($validated['battery_model_id'])
                ? null
                : \App\Models\Product::where('legacy_battery_model_id', $validated['battery_model_id'])->value('id');
        }

        if (array_key_exists('product_id', $validated) && !array_key_exists('battery_model_id', $validated)) {
            $validated['battery_model_id'] = empty($validated['product_id'])
                ? null
                : \App\Models\Product::whereKey($validated['product_id'])->value('legacy_battery_model_id');
        }

        $serial->update($validated);

        $serial = $serial->fresh()->load('batteryModel', 'product', 'allocatedToUser', 'soldToUser');

        return response()->json([
            'message' => 'Serial number updated successfully',
            'serial' => $this->toSerialPayload($serial),
        ]);
    }

    public function allocate(Request $request, SerialNumber $serial)
    {
        $request->validate(['allocated_to' => 'required|integer|exists:users,id']);

        $serial->update([
            'allocated_to' => $request->allocated_to,
            'allocated_date' => now(),
            'status' => 'allocated',
        ]);

        return response()->json([
            'message' => 'Serial allocated successfully',
            'serial' => $this->toSerialPayload($serial->fresh()->load('batteryModel', 'product', 'allocatedToUser', 'soldToUser')),
        ]);
    }

    public function markSold(Request $request, SerialNumber $serial)
    {
        $request->validate(['sold_to' => 'required|integer|exists:users,id']);

        $serial->update([
            'sold_to' => $request->sold_to,
            'sold_date' => now(),
            'status' => 'sold',
        ]);

        return response()->json([
            'message' => 'Serial marked as sold',
            'serial' => $this->toSerialPayload($serial->fresh()->load('batteryModel', 'product', 'allocatedToUser', 'soldToUser')),
        ]);
    }

    public function allocationsIndex(Request $request)
    {
        $perPage = max(1, min((int) $request->query('per_page', 20), 100));

        $query = SerialNumber::query()
            ->whereNotNull('allocated_to')
            ->with(['product', 'batteryModel', 'allocatedToUser'])
            ->selectRaw('MAX(id) as id, product_id, battery_model_id, allocated_to, COUNT(*) as quantity, MAX(allocated_date) as allocated_date')
            ->groupBy('product_id', 'battery_model_id', 'allocated_to');

        $allocations = $query->orderByDesc('allocated_date')->paginate($perPage);

        $results = collect($allocations->items())
            ->map(function (SerialNumber $row) {
                $productName = $row->product?->name;
                $batteryName = $row->batteryModel?->name;

                return [
                    'id' => $row->id,
                    'product_id' => $row->product_id,
                    'battery_model_id' => $row->battery_model_id,
                    'product_name' => $productName,
                    'battery_model_name' => $batteryName ?? $productName,
                    'wholesaler_id' => $row->allocated_to,
                    'wholesaler_email' => $row->allocatedToUser?->email,
                    'quantity' => (int) ($row->quantity ?? 0),
                    'allocated_date' => $row->allocated_date,
                ];
            })
            ->values();

        return response()->json([
            'current_page' => $allocations->currentPage(),
            'data' => $results,
            'results' => $results,
            'first_page_url' => $allocations->url(1),
            'from' => $allocations->firstItem(),
            'last_page' => $allocations->lastPage(),
            'last_page_url' => $allocations->url($allocations->lastPage()),
            'next_page_url' => $allocations->nextPageUrl(),
            'path' => $allocations->path(),
            'per_page' => $allocations->perPage(),
            'prev_page_url' => $allocations->previousPageUrl(),
            'to' => $allocations->lastItem(),
            'total' => $allocations->total(),
        ]);
    }

    public function allocateStock(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'nullable|integer|exists:products,id',
            'battery_model_id' => 'nullable|integer|exists:battery_models,id',
            'wholesaler_id' => 'required|integer|exists:users,id',
            'quantity' => 'required|integer|min:1',
        ]);

        if (empty($validated['product_id']) && empty($validated['battery_model_id'])) {
            return response()->json([
                'message' => 'Either product_id or battery_model_id is required.',
            ], 422);
        }

        if (empty($validated['product_id']) && !empty($validated['battery_model_id'])) {
            $validated['product_id'] = Product::where('legacy_battery_model_id', $validated['battery_model_id'])->value('id');
        }

        if (empty($validated['battery_model_id']) && !empty($validated['product_id'])) {
            $validated['battery_model_id'] = Product::whereKey($validated['product_id'])->value('legacy_battery_model_id');
        }

        $quantity = (int) $validated['quantity'];

        $result = DB::transaction(function () use ($validated, $quantity) {
            $serials = SerialNumber::query()
                ->where('status', 'unallocated')
                ->when(!empty($validated['product_id']), fn ($q) => $q->where('product_id', $validated['product_id']))
                ->when(empty($validated['product_id']) && !empty($validated['battery_model_id']), fn ($q) => $q->where('battery_model_id', $validated['battery_model_id']))
                ->lockForUpdate()
                ->limit($quantity)
                ->get();

            if ($serials->count() < $quantity) {
                abort(422, 'Not enough unallocated serials available for this item.');
            }

            $ids = $serials->pluck('id');

            SerialNumber::whereIn('id', $ids)->update([
                'allocated_to' => $validated['wholesaler_id'],
                'allocated_date' => now(),
                'status' => 'allocated',
            ]);

            return SerialNumber::query()
                ->whereIn('id', $ids)
                ->with(['product', 'batteryModel', 'allocatedToUser'])
                ->get();
        });

        $first = $result->first();

        return response()->json([
            'message' => 'Stock allocated successfully',
            'allocation' => [
                'product_id' => $first?->product_id,
                'battery_model_id' => $first?->battery_model_id,
                'product_name' => $first?->product?->name,
                'battery_model_name' => $first?->batteryModel?->name ?? $first?->product?->name,
                'wholesaler_id' => $validated['wholesaler_id'],
                'wholesaler_email' => $first?->allocatedToUser?->email,
                'quantity' => $result->count(),
            ],
            'serials' => $result->map(fn (SerialNumber $serial) => $this->toSerialPayload($serial))->values(),
        ]);
    }

    public function destroy(SerialNumber $serial)
    {
        $serial->delete();
        return response()->json(['message' => 'Serial number deleted successfully']);
    }

    private function toSerialPayload(SerialNumber $serial): array
    {
        $product = $serial->product;
        $battery = $serial->batteryModel;

        return [
            'id' => $serial->id,
            'serial_number' => $serial->serial_number,
            'status' => strtoupper((string) $serial->status),
            'product_id' => $serial->product_id,
            'product_name' => $product?->name,
            'product_type' => $product?->product_type,
            'battery_model_id' => $serial->battery_model_id,
            'battery_model_name' => $battery?->name ?? $product?->name,
            'allocated_to' => $serial->allocated_to,
            'allocated_to_email' => $serial->allocatedToUser?->email,
            'allocated_date' => $serial->allocated_date,
            'sold_to' => $serial->sold_to,
            'sold_to_email' => $serial->soldToUser?->email,
            'sold_date' => $serial->sold_date,
            'created_at' => $serial->created_at,
            'updated_at' => $serial->updated_at,
        ];
    }
}
