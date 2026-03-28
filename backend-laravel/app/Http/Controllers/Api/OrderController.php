<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\TransactionalMail;
use App\Models\Accessory;
use App\Models\BatteryModel;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Stripe\StripeClient;
use Stripe\Webhook;

class OrderController extends Controller
{
    public function stripeWebhook(Request $request)
    {
        $payload = (string) $request->getContent();
        $signature = (string) $request->header('Stripe-Signature', '');
        $webhookSecret = (string) config('services.stripe.webhook_secret');

        try {
            $event = $webhookSecret !== ''
                ? Webhook::constructEvent($payload, $signature, $webhookSecret)
                : json_decode($payload, false, 512, JSON_THROW_ON_ERROR);
        } catch (\Throwable $exception) {
            Log::warning('Invalid Stripe webhook payload', [
                'error' => $exception->getMessage(),
            ]);

            return response()->json(['message' => 'Invalid webhook payload'], 400);
        }

        $type = (string) ($event->type ?? '');
        $object = $event->data->object ?? null;

        if (!$object) {
            return response()->json(['received' => true]);
        }

        $sessionId = (string) ($object->id ?? '');
        $metadataOrderId = (int) (($object->metadata->order_id ?? 0));

        $order = null;
        if ($metadataOrderId > 0) {
            $order = Order::query()->find($metadataOrderId);
        }

        if (!$order && $sessionId !== '') {
            $order = Order::query()->where('stripe_checkout_session_id', $sessionId)->first();
        }

        if (!$order) {
            Log::info('Stripe webhook received for unknown order', [
                'event_type' => $type,
                'session_id' => $sessionId,
                'metadata_order_id' => $metadataOrderId,
            ]);

            return response()->json(['received' => true]);
        }

        if ($type === 'checkout.session.completed') {
            $paymentStatus = strtolower((string) ($object->payment_status ?? ''));
            if ($paymentStatus === 'paid' || $paymentStatus === 'no_payment_required') {
                $order->update(['payment_status' => self::PAYMENT_PAID]);

                $this->sendOrderLifecycleEmail(
                    $order->fresh()->load('user', 'items.itemable', 'items.product'),
                    'Payment Received: ' . $order->order_number,
                    [
                        'heading' => 'Payment Received',
                        'subheading' => 'Stripe payment confirmed',
                        'greeting' => 'Hi ' . ($order->user?->first_name ?? 'Customer') . ',',
                        'lines' => [
                            'Your payment was successfully received for your order.',
                        ],
                        'meta' => [
                            ['label' => 'Order Number:', 'value' => $order->order_number],
                            ['label' => 'Payment Status:', 'value' => self::PAYMENT_PAID],
                        ],
                    ]
                );
            }
        }

        if ($type === 'checkout.session.expired' || $type === 'checkout.session.async_payment_failed') {
            $order->update(['payment_status' => self::PAYMENT_FAILED]);

            $this->sendOrderLifecycleEmail(
                $order->fresh()->load('user', 'items.itemable', 'items.product'),
                'Payment Update: ' . $order->order_number,
                [
                    'heading' => 'Payment Not Completed',
                    'subheading' => 'Stripe payment was not completed',
                    'greeting' => 'Hi ' . ($order->user?->first_name ?? 'Customer') . ',',
                    'lines' => [
                        'We could not complete your payment for this order.',
                        'Please retry payment from your orders page or contact support if this persists.',
                    ],
                    'meta' => [
                        ['label' => 'Order Number:', 'value' => $order->order_number],
                        ['label' => 'Payment Status:', 'value' => self::PAYMENT_FAILED],
                    ],
                ]
            );
        }

        return response()->json(['received' => true]);
    }

    public function index(Request $request)
    {
        $user = auth()->user();
        $status = $request->query('status');
        $perPage = min(max((int) $request->query('per_page', 10), 1), 100);

        $orders = Order::with('user', 'items.itemable', 'items.product')
            ->visibleToUser($user)
            ->when($status, function ($query) use ($status) {
                $query->where('status', $this->normalizeOrderStatus((string) $status));
            })
            ->latest()
            ->paginate($perPage);

        return response()->json($orders);
    }

    public function store(Request $request)
    {
        if ($request->has('items')) {
            $validated = $request->validate([
                'notes' => 'nullable|string',
                'payment_method' => 'nullable|string|in:ONLINE,PAY_LATER,online,pay_later',
                'items' => 'required|array|min:1',
                'items.*.product_type' => 'nullable|string|in:BATTERY_MODEL,ACCESSORY,PRODUCT',
                'items.*.battery_model_id' => 'nullable|integer|exists:battery_models,id',
                'items.*.accessory_id' => 'nullable|integer|exists:accessories,id',
                'items.*.product_id' => 'nullable|integer|exists:products,id',
                'items.*.quantity' => 'required|integer|min:1',
            ]);

            $order = Order::create([
                'order_number' => 'ORD-' . now()->format('YmdHis') . '-' . random_int(1000, 9999),
                'user_id' => $request->user()->id,
                'status' => self::STATUS_PENDING,
                'payment_status' => self::PAYMENT_PENDING,
                'payment_method' => $this->normalizePaymentMethod((string) ($validated['payment_method'] ?? self::METHOD_PAY_LATER)),
                'notes' => $validated['notes'] ?? null,
                'total_amount' => 0,
            ]);

            $totalAmount = 0;
            foreach ($validated['items'] as $item) {
                $quantity = $item['quantity'];
                $resolved = $this->resolveOrderItem($item);
                $itemable = $resolved['itemable'];
                $product = $resolved['product'];

                $unitPrice = $itemable->price ?? 0;
                $totalPrice = $unitPrice * $quantity;
                $totalAmount += $totalPrice;

                OrderItem::create([
                    'order_id' => $order->id,
                    'itemable_type' => get_class($itemable),
                    'itemable_id' => $itemable->id,
                    'product_id' => $product?->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                ]);
            }

            $order->update(['total_amount' => $totalAmount]);

            $response = [
                'message' => 'Order created successfully',
                'order' => $order->load('user', 'items.itemable', 'items.product'),
            ];

            if ($order->payment_method === self::METHOD_ONLINE) {
                $sessionData = $this->createStripeCheckoutSession($order);
                $order->update(['stripe_checkout_session_id' => $sessionData['id']]);
                $response['checkout_url'] = $sessionData['url'];
                $response['message'] = 'Order created. Redirect to Stripe to complete payment.';
            }

            $this->sendOrderLifecycleEmail(
                $order->fresh()->load('user', 'items.itemable', 'items.product'),
                'Order Received: ' . $order->order_number,
                [
                    'heading' => 'Order Received',
                    'subheading' => 'Lithovolt wholesale order confirmation',
                    'greeting' => 'Hi ' . ($order->user?->first_name ?? 'Customer') . ',',
                    'lines' => [
                        'We have received your order and our team will process it shortly.',
                    ],
                    'meta' => [
                        ['label' => 'Order Number:', 'value' => $order->order_number],
                        ['label' => 'Order Status:', 'value' => $order->status],
                        ['label' => 'Payment Method:', 'value' => $order->payment_method],
                        ['label' => 'Order Total:', 'value' => number_format((float) $order->total_amount, 2)],
                    ],
                    'footnote' => 'You can track status updates in your wholesaler order dashboard.',
                ]
            );

            return response()->json($response, 201);
        }

        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'order_number' => 'required|string|unique:orders',
            'total_amount' => 'required|numeric|min:0',
            'status' => 'in:pending,confirmed,shipped,delivered,accepted,rejected,fulfilled,cancelled,PENDING,CONFIRMED,SHIPPED,DELIVERED,ACCEPTED,REJECTED,FULFILLED,CANCELLED',
            'payment_status' => 'in:pending,paid,failed,PENDING,PAID,FAILED',
            'payment_method' => 'nullable|string|in:ONLINE,PAY_LATER,online,pay_later',
            'notes' => 'nullable|string',
        ]);

        $validated['status'] = $this->normalizeOrderStatus((string) ($validated['status'] ?? self::STATUS_PENDING));
        $validated['payment_status'] = $this->normalizePaymentStatus((string) ($validated['payment_status'] ?? self::PAYMENT_PENDING));
        $validated['payment_method'] = $this->normalizePaymentMethod((string) ($validated['payment_method'] ?? self::METHOD_PAY_LATER));

        $order = Order::create($validated);
        return response()->json(['message' => 'Order created successfully', 'order' => $order], 201);
    }

    public function show(Request $request, Order $order)
    {
        if (!$this->canAccessOrder($request->user(), $order)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($order->load('user', 'items.itemable', 'items.product'));
    }

    public function update(Request $request, Order $order)
    {
        if (!$this->canAccessOrder($request->user(), $order)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'status' => 'nullable|in:pending,confirmed,shipped,delivered,accepted,rejected,fulfilled,cancelled,PENDING,CONFIRMED,SHIPPED,DELIVERED,ACCEPTED,REJECTED,FULFILLED,CANCELLED',
            'payment_status' => 'nullable|in:pending,paid,failed,PENDING,PAID,FAILED',
            'payment_method' => 'nullable|string|in:ONLINE,PAY_LATER,online,pay_later',
            'total_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        if (array_key_exists('status', $validated)) {
            $nextStatus = $this->normalizeOrderStatus((string) $validated['status']);
            if (!$this->canTransitionStatus((string) $order->status, $nextStatus)) {
                return response()->json([
                    'message' => "Cannot transition order from {$order->status} to {$nextStatus}.",
                ], 422);
            }
            $validated['status'] = $nextStatus;
        }

        if (array_key_exists('payment_status', $validated)) {
            $validated['payment_status'] = $this->normalizePaymentStatus((string) $validated['payment_status']);
        }

        if (array_key_exists('payment_method', $validated)) {
            $validated['payment_method'] = $this->normalizePaymentMethod((string) $validated['payment_method']);
        }

        $order->update($validated);
        return response()->json(['message' => 'Order updated successfully', 'order' => $order]);
    }

    public function destroy(Request $request, Order $order)
    {
        if (!$this->canAccessOrder($request->user(), $order)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $order->delete();
        return response()->json(['message' => 'Order deleted successfully']);
    }

    public function ordersByUser(Request $request, $userId)
    {
        $actor = $request->user();
        if (!$this->isPrivileged($actor) && (int) $actor->id !== (int) $userId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $orders = Order::where('user_id', $userId)
            ->visibleToUser($actor)
            ->with('items.itemable', 'items.product')
            ->latest()
            ->paginate(10);

        return response()->json($orders);
    }

    public function accept(Request $request, Order $order)
    {
        return $this->transitionOrder($request->user(), $order, self::STATUS_ACCEPTED, 'Order accepted successfully');
    }

    public function reject(Request $request, Order $order)
    {
        return $this->transitionOrder($request->user(), $order, self::STATUS_REJECTED, 'Order rejected successfully');
    }

    public function fulfill(Request $request, Order $order)
    {
        $actor = $request->user();
        if (!$this->isPrivileged($actor)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $current = $this->normalizeOrderStatus((string) $order->status);
        if (!$this->canTransitionStatus($current, self::STATUS_FULFILLED)) {
            return response()->json([
                'message' => "Cannot transition order from {$current} to FULFILLED.",
            ], 422);
        }

        $order->update([
            'status' => self::STATUS_FULFILLED,
            'payment_status' => self::PAYMENT_PAID,
        ]);

        $freshOrder = $order->fresh()->load('user', 'items.itemable', 'items.product');

        $this->sendOrderLifecycleEmail(
            $freshOrder,
            'Order Fulfilled: ' . $freshOrder->order_number,
            [
                'heading' => 'Order Fulfilled',
                'subheading' => 'Your order is now fulfilled',
                'greeting' => 'Hi ' . ($freshOrder->user?->first_name ?? 'Customer') . ',',
                'lines' => [
                    'Your order has been fulfilled and is ready for completion on your side.',
                    'Invoice download is now available from your order list.',
                ],
                'meta' => [
                    ['label' => 'Order Number:', 'value' => $freshOrder->order_number],
                    ['label' => 'Order Status:', 'value' => $freshOrder->status],
                    ['label' => 'Payment Status:', 'value' => $freshOrder->payment_status],
                ],
            ]
        );

        return response()->json([
            'message' => 'Order fulfilled successfully',
            'order' => $freshOrder,
        ]);
    }

    public function invoice(Request $request, Order $order)
    {
        if (!$this->canAccessOrder($request->user(), $order)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($this->normalizeOrderStatus((string) $order->status) !== self::STATUS_FULFILLED) {
            return response()->json([
                'message' => 'Invoice is available only after fulfillment.',
            ], 422);
        }

        $order->load('items.itemable', 'items.product', 'user');

        $pdf = Pdf::loadView('pdf.invoice', [
            'order' => $order,
            'invoiceDate' => now(),
        ])->setPaper('a4');

        return $pdf->download('invoice_' . $order->id . '.pdf');
    }

    private function resolveOrderItem(array $item): array
    {
        if (!empty($item['product_id'])) {
            $product = Product::findOrFail($item['product_id']);

            if (!$product->is_active) {
                abort(422, 'Selected product is inactive.');
            }

            return [
                'itemable' => $product,
                'product' => $product,
            ];
        }

        $productType = $item['product_type'] ?? null;

        if ($productType === 'BATTERY_MODEL' || !empty($item['battery_model_id'])) {
            $battery = BatteryModel::findOrFail($item['battery_model_id']);
            $product = Product::where('legacy_battery_model_id', $battery->id)->first();

            return [
                'itemable' => $battery,
                'product' => $product,
            ];
        }

        if ($productType === 'ACCESSORY' || !empty($item['accessory_id'])) {
            $accessory = Accessory::findOrFail($item['accessory_id']);
            $product = Product::where('legacy_accessory_id', $accessory->id)->first();

            return [
                'itemable' => $accessory,
                'product' => $product,
            ];
        }

        abort(422, 'Unable to resolve order item. Provide product_id or a valid legacy item reference.');
    }

    private const STATUS_PENDING = 'PENDING';
    private const STATUS_ACCEPTED = 'ACCEPTED';
    private const STATUS_REJECTED = 'REJECTED';
    private const STATUS_FULFILLED = 'FULFILLED';
    private const STATUS_CANCELLED = 'CANCELLED';

    private const PAYMENT_PENDING = 'PENDING';
    private const PAYMENT_PAID = 'PAID';
    private const PAYMENT_FAILED = 'FAILED';

    private const METHOD_ONLINE = 'ONLINE';
    private const METHOD_PAY_LATER = 'PAY_LATER';

    private function normalizeOrderStatus(string $status): string
    {
        $status = strtoupper(trim($status));

        return match ($status) {
            'CONFIRMED' => self::STATUS_ACCEPTED,
            'SHIPPED', 'DELIVERED' => self::STATUS_FULFILLED,
            default => $status,
        };
    }

    private function normalizePaymentStatus(string $status): string
    {
        return strtoupper(trim($status));
    }

    private function normalizePaymentMethod(string $method): string
    {
        return strtoupper(trim($method));
    }

    private function createStripeCheckoutSession(Order $order): array
    {
        if (app()->environment('testing')) {
            return [
                'id' => 'cs_test_' . $order->id,
                'url' => 'https://checkout.stripe.com/pay/cs_test_' . $order->id,
            ];
        }

        $secretKey = (string) config('services.stripe.secret');
        if ($secretKey === '') {
            abort(422, 'Stripe is not configured. Add STRIPE_SECRET_KEY in backend environment.');
        }

        $order->loadMissing('items.product', 'items.itemable', 'user');

        $frontendUrl = rtrim((string) env('FRONTEND_URL', config('app.url')), '/');

        $lineItems = [];
        foreach ($order->items as $item) {
            $name = $item->product?->name
                ?? $item->itemable?->name
                ?? ('Order item #' . $item->id);

            $lineItems[] = [
                'price_data' => [
                    'currency' => 'aud',
                    'product_data' => [
                        'name' => $name,
                    ],
                    'unit_amount' => (int) round(((float) $item->unit_price) * 100),
                ],
                'quantity' => (int) $item->quantity,
            ];
        }

        $client = new StripeClient($secretKey);

        $session = $client->checkout->sessions->create([
            'mode' => 'payment',
            'line_items' => $lineItems,
            'success_url' => $frontendUrl . '/wholesaler/orders?payment=success&order=' . $order->id,
            'cancel_url' => $frontendUrl . '/wholesaler/orders/new?payment=cancelled&order=' . $order->id,
            'metadata' => [
                'order_id' => (string) $order->id,
                'order_number' => (string) $order->order_number,
                'customer_email' => (string) ($order->user?->email ?? ''),
            ],
        ]);

        return [
            'id' => (string) $session->id,
            'url' => (string) $session->url,
        ];
    }

    private function canTransitionStatus(string $currentStatus, string $nextStatus): bool
    {
        $current = $this->normalizeOrderStatus($currentStatus);
        $next = $this->normalizeOrderStatus($nextStatus);

        if ($current === $next) {
            return true;
        }

        $transitions = [
            self::STATUS_PENDING => [self::STATUS_ACCEPTED, self::STATUS_REJECTED, self::STATUS_CANCELLED],
            self::STATUS_ACCEPTED => [self::STATUS_FULFILLED, self::STATUS_CANCELLED],
            self::STATUS_REJECTED => [],
            self::STATUS_FULFILLED => [],
            self::STATUS_CANCELLED => [],
        ];

        return in_array($next, $transitions[$current] ?? [], true);
    }

    private function isPrivileged(?User $user): bool
    {
        if (!$user) {
            return false;
        }

        $roleName = strtoupper((string) ($user->role?->name ?? $user->role ?? ''));
        return $roleName === 'ADMIN' || (bool) $user->staffUser;
    }

    private function canAccessOrder(?User $actor, Order $order): bool
    {
        if (!$actor) {
            return false;
        }

        if ((int) $order->user_id === (int) $actor->id) {
            return true;
        }

        return Order::query()
            ->visibleToUser($actor)
            ->whereKey($order->id)
            ->exists();
    }

    private function transitionOrder(?User $actor, Order $order, string $nextStatus, string $successMessage)
    {
        if (!$this->isPrivileged($actor)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $current = $this->normalizeOrderStatus((string) $order->status);
        if (!$this->canTransitionStatus($current, $nextStatus)) {
            return response()->json([
                'message' => "Cannot transition order from {$current} to {$nextStatus}.",
            ], 422);
        }

        $order->update(['status' => $nextStatus]);

        $freshOrder = $order->fresh()->load('user', 'items.itemable', 'items.product');

        $this->sendOrderLifecycleEmail(
            $freshOrder,
            'Order Status Updated: ' . $freshOrder->order_number,
            [
                'heading' => 'Order Status Updated',
                'subheading' => 'Your order status has changed',
                'greeting' => 'Hi ' . ($freshOrder->user?->first_name ?? 'Customer') . ',',
                'lines' => [
                    'Your order status was updated by Lithovolt team.',
                ],
                'meta' => [
                    ['label' => 'Order Number:', 'value' => $freshOrder->order_number],
                    ['label' => 'New Status:', 'value' => $freshOrder->status],
                ],
            ]
        );

        return response()->json([
            'message' => $successMessage,
            'order' => $freshOrder,
        ]);
    }

    private function sendOrderLifecycleEmail(Order $order, string $subject, array $data): void
    {
        $email = (string) ($order->user?->email ?? '');
        if ($email === '') {
            return;
        }

        try {
            Mail::to($email)->send(new TransactionalMail($subject, $data));
        } catch (\Throwable $exception) {
            Log::warning('Failed to send order lifecycle email', [
                'order_id' => $order->id,
                'email' => $email,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    private function buildInvoiceText(Order $order): string
    {
        $lines = [];
        $lines[] = 'Lithovolt Invoice';
        $lines[] = 'Invoice ID: INV-' . $order->id;
        $lines[] = 'Order Number: ' . ($order->order_number ?: ('ORD-' . $order->id));
        $lines[] = 'Customer: ' . ($order->user?->full_name ?: $order->user?->email ?: 'Unknown');
        $lines[] = 'Status: ' . $this->normalizeOrderStatus((string) $order->status);
        $lines[] = 'Payment Status: ' . $this->normalizePaymentStatus((string) $order->payment_status);
        $lines[] = 'Date: ' . now()->toDateTimeString();
        $lines[] = '';
        $lines[] = 'Items:';

        foreach ($order->items as $index => $item) {
            $name = $item->product?->name
                ?? $item->itemable?->name
                ?? ('Item #' . $item->id);

            $lines[] = sprintf(
                '%d. %s | Qty: %d | Unit: %.2f | Line Total: %.2f',
                $index + 1,
                $name,
                (int) $item->quantity,
                (float) $item->unit_price,
                (float) $item->total_price
            );
        }

        $lines[] = '';
        $lines[] = 'Total Amount: ' . number_format((float) $order->total_amount, 2);

        if (!empty($order->notes)) {
            $lines[] = 'Notes: ' . (string) $order->notes;
        }

        return implode("\n", $lines) . "\n";
    }
}
