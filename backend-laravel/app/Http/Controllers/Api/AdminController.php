<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use App\Models\BatteryModel;
use App\Models\Warranty;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboard()
    {
        $totalUsers = User::count();
        $totalOrders = Order::count();
        $totalProducts = BatteryModel::count();
        $totalWarranties = Warranty::count();

        $recentOrders = Order::with('user')->latest()->limit(5)->get();
        $recentClaims = \App\Models\WarrantyClaim::with('user')->latest()->limit(5)->get();

        return response()->json([
            'stats' => [
                'total_users' => $totalUsers,
                'total_orders' => $totalOrders,
                'total_products' => $totalProducts,
                'total_warranties' => $totalWarranties,
            ],
            'recent_orders' => $recentOrders,
            'recent_claims' => $recentClaims,
        ]);
    }

    public function userStats()
    {
        $stats = [
            'total' => User::count(),
            'verified' => User::where('is_verified', true)->count(),
            'unverified' => User::where('is_verified', false)->count(),
            'by_role' => User::groupBy('role_id')->selectRaw('role_id, count(*) as count')->get(),
        ];

        return response()->json($stats);
    }

    public function orderStats()
    {
        $stats = [
            'total' => Order::count(),
            'pending' => Order::where('status', 'pending')->count(),
            'confirmed' => Order::where('status', 'confirmed')->count(),
            'shipped' => Order::where('status', 'shipped')->count(),
            'delivered' => Order::where('status', 'delivered')->count(),
            'cancelled' => Order::where('status', 'cancelled')->count(),
        ];

        return response()->json($stats);
    }

    public function warrantyStats()
    {
        $stats = [
            'total' => Warranty::count(),
            'active' => Warranty::where('status', 'active')->count(),
            'expired' => Warranty::where('status', 'expired')->count(),
            'claimed' => Warranty::where('status', 'claimed')->count(),
        ];

        return response()->json($stats);
    }

    public function exportData($model)
    {
        $data = match($model) {
            'users' => User::all(),
            'orders' => Order::with('user', 'items')->get(),
            'warranties' => Warranty::with('batteryModel', 'user')->get(),
            'claims' => \App\Models\WarrantyClaim::with('warranty', 'user')->get(),
            default => []
        };

        return response()->json($data);
    }
}
