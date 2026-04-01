<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\BatteryModel;
use App\Models\Order;
use App\Models\Product;
use App\Models\SerialNumber;
use App\Models\User;
use App\Models\Warranty;
use App\Models\WarrantyClaim;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AdminController extends Controller
{
    public function trends(Request $request)
    {
        $days = (int) $request->query('days', 30);
        if (!in_array($days, [7, 30, 90], true)) {
            $days = 30;
        }

        $end = Carbon::now()->endOfDay();
        $start = Carbon::now()->subDays($days - 1)->startOfDay();

        $labels = [];
        $keys = [];
        for ($i = 0; $i < $days; $i++) {
            $day = $start->copy()->addDays($i);
            $labels[] = $day->format('M d');
            $keys[] = $day->toDateString();
        }

        $ordersSeries = $this->buildDailySeries(Order::query(), $start, $end, $keys);
        $warrantiesSeries = $this->buildDailySeries(Warranty::query(), $start, $end, $keys);
        $usersSeries = $this->buildDailySeries(User::query(), $start, $end, $keys);

        $totals = [
            'orders' => array_sum($ordersSeries),
            'warranties' => array_sum($warrantiesSeries),
            'users' => array_sum($usersSeries),
        ];

        $previousStart = $start->copy()->subDays($days);
        $previousEnd = $start->copy()->subSecond();

        $previousTotals = [
            'orders' => $this->countInRange(Order::query(), $previousStart, $previousEnd),
            'warranties' => $this->countInRange(Warranty::query(), $previousStart, $previousEnd),
            'users' => $this->countInRange(User::query(), $previousStart, $previousEnd),
        ];

        return response()->json([
            'range' => [
                'days' => $days,
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
            ],
            'series' => [
                'labels' => $labels,
                'orders' => $ordersSeries,
                'warranties' => $warrantiesSeries,
                'users' => $usersSeries,
            ],
            'totals' => $totals,
            'previous_totals' => $previousTotals,
            'delta_percent' => [
                'orders' => $this->calculateDeltaPercent($totals['orders'], $previousTotals['orders']),
                'warranties' => $this->calculateDeltaPercent($totals['warranties'], $previousTotals['warranties']),
                'users' => $this->calculateDeltaPercent($totals['users'], $previousTotals['users']),
            ],
        ]);
    }

    public function metrics()
    {
        $batteryCatalogQuery = Product::query()->where('product_type', 'BATTERY');
        $catalogBatteryModels = (clone $batteryCatalogQuery)->count();
        $catalogAvailableBatteryUnits = (int) (clone $batteryCatalogQuery)->sum('available_quantity');

        $legacyBatteryModels = BatteryModel::count();
        $legacyAvailableBatteryUnits = (int) BatteryModel::sum('available_quantity');

        $totalProducts = $catalogBatteryModels > 0 ? $catalogBatteryModels : $legacyBatteryModels;
        $totalAvailableBatteryUnits = $catalogBatteryModels > 0 ? $catalogAvailableBatteryUnits : $legacyAvailableBatteryUnits;

        $totalUsers = User::count();
        $totalOrders = Order::count();
        $totalWarranties = Warranty::count();

        // Get users by role (using relationship)
        $usersByRole = [
            'ADMIN' => User::whereHas('modelRole', function($query) {
                $query->where('name', 'ADMIN');
            })->count(),
            'WHOLESALER' => User::whereHas('modelRole', function($query) {
                $query->where('name', 'WHOLESALER');
            })->count(),
            'CONSUMER' => User::whereHas('modelRole', function($query) {
                $query->where('name', 'CONSUMER');
            })->count(),
        ];

        // Get order statuses
        $ordersByStatus = [
            'PENDING' => Order::where('status', 'pending')->count(),
            'PROCESSING' => Order::where('status', 'processing')->count(),
            'SHIPPED' => Order::where('status', 'shipped')->count(),
            'DELIVERED' => Order::where('status', 'delivered')->count(),
            'CANCELLED' => Order::where('status', 'cancelled')->count(),
        ];

        // Get serial numbers by status
        $serialsByStatus = [
            'AVAILABLE' => SerialNumber::query()->whereRaw('UPPER(status) = ?', ['AVAILABLE'])->count(),
            'ALLOCATED' => SerialNumber::query()->whereRaw('UPPER(status) = ?', ['ALLOCATED'])->count(),
            'SOLD' => SerialNumber::query()->whereRaw('UPPER(status) = ?', ['SOLD'])->count(),
        ];

        // Get warranty claim statuses
        $warrantyClaimsByStatus = [
            'PENDING' => WarrantyClaim::where('status', 'pending')->count(),
            'PROCESSING' => WarrantyClaim::where('status', 'processing')->count(),
            'RESOLVED' => WarrantyClaim::where('status', 'resolved')->count(),
        ];

        return response()->json([
            'totals' => [
                'users' => $totalUsers,
                'orders' => $totalOrders,
                'products' => $totalProducts,
                'warranties' => $totalWarranties,
            ],
            'users_by_role' => $usersByRole,
            'orders_by_status' => $ordersByStatus,
            'serials_by_status' => $serialsByStatus,
            'warranty_claims_by_status' => $warrantyClaimsByStatus,
            'battery_models' => $totalProducts,
            'battery_available_total' => $totalAvailableBatteryUnits,
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

    private function buildDailySeries($query, Carbon $start, Carbon $end, array $keys): array
    {
        $raw = $query
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw('DATE(created_at) as date_key, COUNT(*) as aggregate')
            ->groupBy('date_key')
            ->pluck('aggregate', 'date_key')
            ->toArray();

        return array_map(function (string $key) use ($raw) {
            return (int) ($raw[$key] ?? 0);
        }, $keys);
    }

    private function countInRange($query, Carbon $start, Carbon $end): int
    {
        return (int) $query->whereBetween('created_at', [$start, $end])->count();
    }

    private function calculateDeltaPercent(int $current, int $previous): ?float
    {
        if ($previous === 0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        return round((($current - $previous) / $previous) * 100, 2);
    }
}
