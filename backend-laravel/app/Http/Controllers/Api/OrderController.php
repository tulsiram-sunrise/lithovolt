<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Accessory;
use App\Models\BatteryModel;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with('user', 'items.itemable')->paginate(10);
        return response()->json($orders);
    }

    public function store(Request $request)
    {
        if ($request->has('items')) {
            $validated = $request->validate([
                'notes' => 'nullable|string',
                'items' => 'required|array|min:1',
                'items.*.product_type' => 'required|string|in:BATTERY_MODEL,ACCESSORY,PRODUCT',
                'items.*.battery_model_id' => 'nullable|integer|exists:battery_models,id',
                'items.*.accessory_id' => 'nullable|integer|exists:accessories,id',
                'items.*.product_id' => 'nullable|integer|exists:products,id',
                'items.*.quantity' => 'required|integer|min:1',
            ]);

            $order = Order::create([
                'order_number' => 'ORD-' . now()->format('YmdHis') . '-' . random_int(1000, 9999),
                'user_id' => $request->user()->id,
                'status' => 'PENDING',
                'payment_status' => 'PENDING',
                'notes' => $validated['notes'] ?? null,
                'total_amount' => 0,
            ]);

            $totalAmount = 0;
            foreach ($validated['items'] as $item) {
                $productType = $item['product_type'];
                $quantity = $item['quantity'];
                $itemable = null;

                if ($productType === 'BATTERY_MODEL') {
                    $itemable = BatteryModel::findOrFail($item['battery_model_id']);
                } elseif ($productType === 'ACCESSORY') {
                    $itemable = Accessory::findOrFail($item['accessory_id']);
                } else {
                    $itemable = Product::findOrFail($item['product_id']);
                }

                $unitPrice = $itemable->price ?? 0;
                $totalPrice = $unitPrice * $quantity;
                $totalAmount += $totalPrice;

                OrderItem::create([
                    'order_id' => $order->id,
                    'itemable_type' => get_class($itemable),
                    'itemable_id' => $itemable->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                ]);
            }

            $order->update(['total_amount' => $totalAmount]);

            return response()->json([
                'message' => 'Order created successfully',
                'order' => $order->load('user', 'items')
            ], 201);
        }

        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'order_number' => 'required|string|unique:orders',
            'total_amount' => 'required|numeric|min:0',
            'status' => 'in:pending,confirmed,shipped,delivered,cancelled,PENDING,CONFIRMED,SHIPPED,DELIVERED,CANCELLED',
            'payment_status' => 'in:pending,paid,failed,PENDING,PAID,FAILED',
            'notes' => 'nullable|string',
        ]);

        $order = Order::create($validated);
        return response()->json(['message' => 'Order created successfully', 'order' => $order], 201);
    }

    public function show(Order $order)
    {
        return response()->json($order->load('user', 'items.itemable'));
    }

    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'nullable|in:pending,confirmed,shipped,delivered,cancelled',
            'payment_status' => 'nullable|in:pending,paid,failed',
            'total_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $order->update($validated);
        return response()->json(['message' => 'Order updated successfully', 'order' => $order]);
    }

    public function destroy(Order $order)
    {
        $order->delete();
        return response()->json(['message' => 'Order deleted successfully']);
    }

    public function ordersByUser($userId)
    {
        $orders = Order::where('user_id', $userId)->with('items')->paginate(10);
        return response()->json($orders);
    }
}
