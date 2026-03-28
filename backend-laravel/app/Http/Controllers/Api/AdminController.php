<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\BatteryModel;
use App\Models\Order;
use App\Models\User;
use App\Models\Warranty;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AdminController extends Controller
{
    public function metrics()
    {
        $totalUsers = User::count();
        $totalOrders = Order::count();
        $totalProducts = BatteryModel::count();
        $totalWarranties = Warranty::count();

        $pendingOrders = Order::whereIn('status', ['pending', 'PENDING'])->count();
        $claimedWarranties = Warranty::where('status', 'claimed')->count();

        return response()->json([
            'totals' => [
                'users' => $totalUsers,
                'orders' => $totalOrders,
                'products' => $totalProducts,
                'warranties' => $totalWarranties,
            ],
            'pending_orders' => $pendingOrders,
            'claimed_warranties' => $claimedWarranties,
        ]);
    }

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
            'pending' => Order::whereIn('status', ['pending', 'PENDING'])->count(),
            'accepted' => Order::whereIn('status', ['confirmed', 'accepted', 'CONFIRMED', 'ACCEPTED'])->count(),
            'rejected' => Order::whereIn('status', ['rejected', 'REJECTED'])->count(),
            'fulfilled' => Order::whereIn('status', ['shipped', 'delivered', 'fulfilled', 'SHIPPED', 'DELIVERED', 'FULFILLED'])->count(),
            'cancelled' => Order::whereIn('status', ['cancelled', 'CANCELLED'])->count(),
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
        $allowedModels = ['users', 'orders', 'warranties', 'claims'];
        if (!in_array($model, $allowedModels, true)) {
            return response()->json([
                'message' => 'Invalid export model.',
                'allowed_models' => $allowedModels,
            ], 422);
        }

        $data = match ($model) {
            'users' => User::all(),
            'orders' => Order::with('user', 'items')->get(),
            'warranties' => Warranty::with('batteryModel', 'user')->get(),
            'claims' => \App\Models\WarrantyClaim::with('warranty', 'user')->get(),
        };

        return response()->json($data);
    }

    public function activity(Request $request)
    {
        $pageSize = min(max((int) $request->query('page_size', 25), 1), 200);
        $scope = strtoupper((string) $request->query('scope', ''));
        $eventType = strtolower((string) $request->query('event_type', ''));
        $search = trim((string) $request->query('search', ''));
        $fromDate = $this->parseDate($request->query('from'));
        $toDate = $this->parseDate($request->query('to'));

        $query = AuditLog::query()
            ->with('user:id,first_name,last_name,email')
            ->orderByDesc('created_at');

        if ($scope !== '') {
            $query->where('entity_type', $scope);
        }

        if ($eventType !== '') {
            $query->where('event_type', $eventType);
        }

        if ($fromDate) {
            $query->where('created_at', '>=', $fromDate);
        }

        if ($toDate) {
            $query->where('created_at', '<=', $toDate);
        }

        if ($search !== '') {
            $query->where(function ($inner) use ($search) {
                $inner->where('entity_type', 'like', "%{$search}%")
                    ->orWhere('event_type', 'like', "%{$search}%")
                    ->orWhere('request_path', 'like', "%{$search}%")
                    ->orWhere('old_values', 'like', "%{$search}%")
                    ->orWhere('new_values', 'like', "%{$search}%");
            });
        }

        $logs = $query->paginate($pageSize)->appends($request->query());

        $scopeCounts = AuditLog::query()
            ->selectRaw('UPPER(entity_type) as scope, COUNT(*) as aggregate')
            ->groupBy('scope')
            ->pluck('aggregate', 'scope')
            ->toArray();

        $items = collect($logs->items())->map(function (AuditLog $log) {
            $userName = trim((($log->user->first_name ?? '') . ' ' . ($log->user->last_name ?? '')));

            return [
                'id' => $log->id,
                'scope' => strtoupper((string) $log->entity_type),
                'entity_id' => $log->entity_id,
                'event_type' => $log->event_type,
                'occurred_at' => optional($log->created_at)?->toIso8601String(),
                'summary' => sprintf('%s #%s %s', strtoupper((string) $log->entity_type), (string) ($log->entity_id ?? '-'), $log->event_type),
                'metadata' => [
                    'changed_fields' => $log->changed_fields,
                    'old_values' => $log->old_values,
                    'new_values' => $log->new_values,
                    'request_method' => $log->request_method,
                    'request_path' => $log->request_path,
                    'ip_address' => $log->ip_address,
                    'actor' => $userName !== '' ? $userName : ($log->user->email ?? 'System'),
                ],
            ];
        })->values();

        return response()->json([
            'items' => $items,
            'total' => $logs->total(),
            'current_page' => $logs->currentPage(),
            'last_page' => $logs->lastPage(),
            'page_size' => $logs->perPage(),
            'scope_counts' => $scopeCounts,
            'applied_filters' => [
                'scope' => $scope !== '' ? $scope : null,
                'event_type' => $eventType !== '' ? strtoupper($eventType) : null,
                'from' => $fromDate?->toIso8601String(),
                'to' => $toDate?->toIso8601String(),
                'search' => $search !== '' ? $search : null,
                'page_size' => $pageSize,
            ],
        ]);
    }

    private function parseDate(?string $value): ?Carbon
    {
        if (!$value) {
            return null;
        }

        try {
            return Carbon::parse($value);
        } catch (\Throwable $exception) {
            return null;
        }
    }
}
