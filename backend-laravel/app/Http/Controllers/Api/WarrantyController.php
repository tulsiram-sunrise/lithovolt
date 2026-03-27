<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\SerialNumber;
use App\Models\User;
use App\Models\Warranty;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class WarrantyController extends Controller
{
    public function index(Request $request)
    {
        $perPage = max(1, min((int) $request->query('per_page', 10), 100));
        $user = auth()->user();

        $warranties = Warranty::with('batteryModel', 'product', 'user', 'claims')
            ->visibleToUser($user)
            ->orderByDesc('created_at')
            ->paginate($perPage);

        $results = collect($warranties->items())
            ->map(fn (Warranty $warranty) => $this->toWarrantyPayload($warranty))
            ->values();

        return response()->json([
            'current_page' => $warranties->currentPage(),
            'data' => $results,
            'results' => $results,
            'first_page_url' => $warranties->url(1),
            'from' => $warranties->firstItem(),
            'last_page' => $warranties->lastPage(),
            'last_page_url' => $warranties->url($warranties->lastPage()),
            'next_page_url' => $warranties->nextPageUrl(),
            'path' => $warranties->path(),
            'per_page' => $warranties->perPage(),
            'prev_page_url' => $warranties->previousPageUrl(),
            'to' => $warranties->lastItem(),
            'total' => $warranties->total(),
        ]);
    }

    public function store(Request $request)
    {
        if (!$request->filled('warranty_number')) {
            return $this->issueFromSerial($request);
        }

        $validated = $request->validate([
            'warranty_number' => 'required|string|unique:warranties',
            'battery_model_id' => 'nullable|integer|exists:battery_models,id',
            'product_id' => 'nullable|integer|exists:products,id',
            'user_id' => 'required|integer|exists:users,id',
            'serial_number' => 'required|string',
            'issue_date' => 'required|date',
            'expiry_date' => 'required|date|after:issue_date',
            'status' => 'in:active,expired,claimed',
        ]);

        if (empty($validated['product_id']) && empty($validated['battery_model_id'])) {
            return response()->json([
                'message' => 'Either product_id or battery_model_id is required.'
            ], 422);
        }

        if (empty($validated['product_id']) && !empty($validated['battery_model_id'])) {
            $validated['product_id'] = Product::where('legacy_battery_model_id', $validated['battery_model_id'])->value('id');
        }

        if (empty($validated['battery_model_id']) && !empty($validated['product_id'])) {
            $validated['battery_model_id'] = Product::whereKey($validated['product_id'])->value('legacy_battery_model_id');
        }

        $warranty = Warranty::create($validated)->load('batteryModel', 'product', 'user', 'claims');
        return response()->json([
            'message' => 'Warranty created successfully',
            'warranty' => $this->toWarrantyPayload($warranty, true),
        ], 201);
    }

    private function issueFromSerial(Request $request)
    {
        $validated = $request->validate([
            'serial_number' => 'required|string|exists:serial_numbers,serial_number',
            'consumer_email' => 'nullable|email',
            'consumer_phone' => 'nullable|string|max:20',
            'consumer_first_name' => 'nullable|string|max:100',
            'consumer_last_name' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        if (empty($validated['consumer_email']) && empty($validated['consumer_phone'])) {
            return response()->json([
                'message' => 'Provide consumer_email or consumer_phone.',
            ], 422);
        }

        $serial = SerialNumber::with('product', 'batteryModel')->where('serial_number', $validated['serial_number'])->firstOrFail();

        if (Warranty::where('serial_number', $serial->serial_number)->whereIn('status', ['active', 'ACTIVE'])->exists()) {
            return response()->json([
                'message' => 'An active warranty already exists for this serial number.',
            ], 422);
        }

        $consumer = null;
        if (!empty($validated['consumer_email'])) {
            $consumer = User::where('email', $validated['consumer_email'])->first();
        }
        if (!$consumer && !empty($validated['consumer_phone'])) {
            $consumer = User::where('phone', $validated['consumer_phone'])->first();
        }

        if (!$consumer) {
            $email = $validated['consumer_email'] ?? ('consumer+' . now()->timestamp . random_int(100, 999) . '@example.com');
            $phone = $validated['consumer_phone'] ?? $this->generateUniquePhone();

            $consumer = User::create([
                'first_name' => $validated['consumer_first_name'] ?? 'Consumer',
                'last_name' => $validated['consumer_last_name'] ?? 'User',
                'email' => $email,
                'phone' => $phone,
                'password' => Str::random(20),
                'is_verified' => true,
                'is_active' => true,
            ]);
        }

        $product = $serial->product;
        $batteryModelId = $serial->battery_model_id ?? $product?->legacy_battery_model_id;

        if (!$batteryModelId) {
            return response()->json([
                'message' => 'Serial is not mapped to a battery model required by the current warranty schema.',
            ], 422);
        }

        $warrantyMonths = (int) ($product?->default_warranty_months ?? 0);
        if ($warrantyMonths <= 0) {
            $warrantyMonths = 12;
        }

        $issueDate = Carbon::now()->startOfDay();
        $expiryDate = (clone $issueDate)->addMonthsNoOverflow($warrantyMonths);

        $warranty = Warranty::create([
            'warranty_number' => $this->generateWarrantyNumber(),
            'battery_model_id' => $batteryModelId,
            'product_id' => $serial->product_id,
            'user_id' => $consumer->id,
            'serial_number' => $serial->serial_number,
            'issue_date' => $issueDate->toDateString(),
            'expiry_date' => $expiryDate->toDateString(),
            'status' => 'active',
        ])->load('batteryModel', 'product', 'user', 'claims');

        if (strtoupper((string) $serial->status) !== 'SOLD') {
            $serial->update([
                'status' => 'sold',
                'sold_to' => $consumer->id,
                'sold_date' => now(),
            ]);
        }

        return response()->json([
            'message' => 'Warranty issued successfully',
            'warranty' => $this->toWarrantyPayload($warranty, true),
        ], 201);
    }

    public function show(Warranty $warranty)
    {
        return response()->json($this->toWarrantyPayload($warranty->load('batteryModel', 'product', 'user', 'claims'), true));
    }

    public function update(Request $request, Warranty $warranty)
    {
        $validated = $request->validate([
            'status' => 'nullable|in:active,expired,claimed',
        ]);

        $warranty->update($validated);
        return response()->json([
            'message' => 'Warranty updated successfully',
            'warranty' => $this->toWarrantyPayload($warranty->fresh()->load('batteryModel', 'product', 'user', 'claims'), true),
        ]);
    }

    public function destroy(Warranty $warranty)
    {
        $warranty->delete();
        return response()->json(['message' => 'Warranty deleted successfully']);
    }

    public function validateQRCode($qrCode)
    {
        $warranty = Warranty::where('qr_code', $qrCode)->first();
        
        if (!$warranty) {
            return response()->json(['valid' => false, 'message' => 'Invalid QR code'], 404);
        }

        return response()->json([
            'valid' => true,
            'warranty' => $this->toWarrantyPayload($warranty->load('batteryModel', 'product', 'user', 'claims'), true),
            'is_expired' => $this->isWarrantyExpired($warranty),
        ]);
    }

    public function verify($serialNumber)
    {
        $warranty = Warranty::with('batteryModel', 'product', 'user', 'claims')
            ->where('serial_number', $serialNumber)
            ->latest('issue_date')
            ->first();

        if (!$warranty) {
            return response()->json([
                'valid' => false,
                'message' => 'Warranty not found for this serial number.',
            ], 404);
        }

        $isExpired = $this->isWarrantyExpired($warranty);

        return response()->json([
            'valid' => !$isExpired,
            'is_expired' => $isExpired,
            'warranty' => $this->toWarrantyPayload($warranty, true),
        ]);
    }

    private function toWarrantyPayload(Warranty $warranty, bool $includeRelations = false): array
    {
        $product = $warranty->product;
        $battery = $warranty->batteryModel;
        $user = $warranty->user;

        $payload = [
            'id' => $warranty->id,
            'warranty_number' => $warranty->warranty_number,
            'status' => strtoupper((string) $warranty->status),
            'serial_number' => $warranty->serial_number,
            'issue_date' => $warranty->issue_date,
            'expiry_date' => $warranty->expiry_date,
            'is_expired' => $this->isWarrantyExpired($warranty),
            'user_id' => $warranty->user_id,
            'consumer_name' => $user?->full_name
                ?: trim(($user?->first_name ?? '') . ' ' . ($user?->last_name ?? ''))
                ?: $user?->email,
            'consumer_email' => $user?->email,
            'product_id' => $warranty->product_id,
            'product_name' => $product?->name,
            'product_type' => $product?->product_type,
            'battery_model_id' => $warranty->battery_model_id,
            'battery_model_name' => $battery?->name ?? $product?->name,
            'claims_count' => $warranty->claims?->count() ?? 0,
            'created_at' => $warranty->created_at,
            'updated_at' => $warranty->updated_at,
        ];

        if ($includeRelations) {
            $payload['product'] = $product;
            $payload['battery_model'] = $battery;
            $payload['user'] = $user;
            $payload['claims'] = $warranty->claims;
        }

        return $payload;
    }

    private function isWarrantyExpired(Warranty $warranty): bool
    {
        if (!$warranty->expiry_date) {
            return false;
        }

        return Carbon::now()->greaterThan(Carbon::parse($warranty->expiry_date)->endOfDay());
    }

    private function generateWarrantyNumber(): string
    {
        do {
            $candidate = 'WRT-' . now()->format('Ymd') . '-' . random_int(100000, 999999);
        } while (Warranty::where('warranty_number', $candidate)->exists());

        return $candidate;
    }

    private function generateUniquePhone(): string
    {
        do {
            $candidate = '9' . str_pad((string) random_int(0, 999999999), 9, '0', STR_PAD_LEFT);
        } while (User::where('phone', $candidate)->exists());

        return $candidate;
    }
}
