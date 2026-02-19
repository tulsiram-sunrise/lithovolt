<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with('user', 'items')->paginate(10);
        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'order_number' => 'required|string|unique:orders',
            'total_amount' => 'required|numeric|min:0',
            'status' => 'in:pending,confirmed,shipped,delivered,cancelled',
            'payment_status' => 'in:pending,paid,failed',
            'notes' => 'nullable|string',
        ]);

        $order = Order::create($validated);
        return response()->json(['message' => 'Order created successfully', 'order' => $order], 201);
    }

    public function show(Order $order)
    {
        return response()->json($order->load('user', 'items'));
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
