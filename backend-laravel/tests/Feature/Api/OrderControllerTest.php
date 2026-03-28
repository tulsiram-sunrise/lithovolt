<?php

namespace Tests\Feature\Api;

use App\Mail\TransactionalMail;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class OrderControllerTest extends ApiTestCase
{
    public function test_index_returns_orders(): void
    {
        $user = $this->createUser('admin');
        Order::factory()->count(2)->create(['user_id' => $user->id]);
        $this->actingAsUser($user);

        $this->getJson('/api/orders')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_store_creates_order(): void
    {
        $user = $this->createUser('admin');
        $this->actingAsUser($user);

        $response = $this->postJson('/api/orders', [
            'user_id' => $user->id,
            'order_number' => 'ORD-00001',
            'total_amount' => 1500,
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('orders', ['order_number' => 'ORD-00001']);
    }

    public function test_store_creates_order_with_items_and_normalizes_status(): void
    {
        Mail::fake();

        $wholesaler = $this->createUser('wholesaler');
        $product = Product::query()->create([
            'name' => 'Bulk Product',
            'sku' => 'BULK-001',
            'is_active' => true,
            'price' => 1200,
            'total_quantity' => 100,
            'available_quantity' => 100,
        ]);

        $this->actingAsUser($wholesaler);

        $response = $this->postJson('/api/orders', [
            'notes' => 'Bulk purchase',
            'items' => [
                [
                    'product_type' => 'PRODUCT',
                    'product_id' => $product->id,
                    'quantity' => 2,
                ],
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('order.status', 'PENDING')
            ->assertJsonPath('order.total_amount', 2400)
            ->assertJsonPath('order.payment_method', 'PAY_LATER');

        $this->assertDatabaseHas('orders', [
            'user_id' => $wholesaler->id,
            'status' => 'PENDING',
            'total_amount' => 2400,
        ]);

        $this->assertDatabaseHas('order_items', [
            'order_id' => $response->json('order.id'),
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_price' => 1200,
            'total_price' => 2400,
        ]);

        Mail::assertSent(TransactionalMail::class, 1);
    }

    public function test_store_online_order_returns_stripe_checkout_url(): void
    {
        $wholesaler = $this->createUser('wholesaler');
        $product = Product::query()->create([
            'name' => 'Online Bulk Product',
            'sku' => 'BULK-ONLINE-001',
            'is_active' => true,
            'price' => 800,
            'total_quantity' => 100,
            'available_quantity' => 100,
        ]);

        $this->actingAsUser($wholesaler);

        $response = $this->postJson('/api/orders', [
            'payment_method' => 'ONLINE',
            'items' => [
                [
                    'product_type' => 'PRODUCT',
                    'product_id' => $product->id,
                    'quantity' => 1,
                ],
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('order.payment_method', 'ONLINE')
            ->assertJsonPath('checkout_url', 'https://checkout.stripe.com/pay/cs_test_' . $response->json('order.id'));

        $this->assertDatabaseHas('orders', [
            'id' => $response->json('order.id'),
            'payment_method' => 'ONLINE',
            'stripe_checkout_session_id' => 'cs_test_' . $response->json('order.id'),
        ]);
    }

    public function test_show_returns_order(): void
    {
        $user = $this->createUser('admin');
        $order = Order::factory()->create(['user_id' => $user->id]);
        $this->actingAsUser($user);

        $this->getJson('/api/orders/' . $order->id)
            ->assertOk()
            ->assertJsonPath('id', $order->id);
    }

    public function test_wholesaler_can_only_view_their_own_orders(): void
    {
        $wholesalerRole = $this->createRole('wholesaler');
        $owner = User::factory()->create(['role_id' => $wholesalerRole->id]);
        $other = User::factory()->create(['role_id' => $wholesalerRole->id]);

        $ownerOrder = Order::factory()->create(['user_id' => $owner->id]);
        $otherOrder = Order::factory()->create(['user_id' => $other->id]);

        $this->actingAsUser($owner);

        $this->getJson('/api/orders')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $ownerOrder->id);

        $this->getJson('/api/orders/' . $otherOrder->id)
            ->assertStatus(403)
            ->assertJsonPath('message', 'Forbidden');
    }

    public function test_update_modifies_order(): void
    {
        $user = $this->actingAsBackofficeAdmin();
        $order = Order::factory()->create(['user_id' => $user->id]);

        $this->putJson('/api/orders/' . $order->id, [
            'status' => 'confirmed',
        ])->assertOk();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'ACCEPTED']);
    }

    public function test_update_rejects_invalid_status_transition(): void
    {
        $this->actingAsBackofficeAdmin();
        $order = Order::factory()->create([
            'status' => 'FULFILLED',
        ]);

        $this->putJson('/api/orders/' . $order->id, [
            'status' => 'PENDING',
        ])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Cannot transition order from FULFILLED to PENDING.');
    }

    public function test_destroy_deletes_order(): void
    {
        $user = $this->actingAsBackofficeAdmin();
        $order = Order::factory()->create(['user_id' => $user->id]);

        $this->deleteJson('/api/orders/' . $order->id)->assertOk();
        $this->assertSoftDeleted('orders', ['id' => $order->id]);
    }

    public function test_orders_by_user_returns_orders(): void
    {
        $user = $this->createUser('admin');
        Order::factory()->count(2)->create(['user_id' => $user->id]);
        $this->actingAsUser($user);

        $this->getJson('/api/orders/user/' . $user->id)
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_orders_by_user_is_forbidden_for_other_non_privileged_user(): void
    {
        $wholesalerRole = $this->createRole('wholesaler');
        $owner = User::factory()->create(['role_id' => $wholesalerRole->id]);
        $other = User::factory()->create(['role_id' => $wholesalerRole->id]);
        Order::factory()->create(['user_id' => $owner->id]);

        $this->actingAsUser($other);

        $this->getJson('/api/orders/user/' . $owner->id)
            ->assertStatus(403)
            ->assertJsonPath('message', 'Forbidden');
    }

    public function test_admin_can_accept_reject_and_fulfill_order(): void
    {
        Mail::fake();

        $this->actingAsBackofficeAdmin();
        $order = Order::factory()->create([
            'status' => 'PENDING',
            'payment_status' => 'PENDING',
        ]);

        $this->postJson('/api/orders/' . $order->id . '/accept')
            ->assertOk()
            ->assertJsonPath('order.status', 'ACCEPTED');

        $this->postJson('/api/orders/' . $order->id . '/fulfill')
            ->assertOk()
            ->assertJsonPath('order.status', 'FULFILLED')
            ->assertJsonPath('order.payment_status', 'PAID');

        $rejectedOrder = Order::factory()->create(['status' => 'PENDING']);
        $this->postJson('/api/orders/' . $rejectedOrder->id . '/reject')
            ->assertOk()
            ->assertJsonPath('order.status', 'REJECTED');

        Mail::assertSent(TransactionalMail::class, 3);
    }

    public function test_invoice_is_available_only_for_fulfilled_order(): void
    {
        $owner = $this->createUser('wholesaler');
        $this->actingAsUser($owner);

        $pendingOrder = Order::factory()->create([
            'user_id' => $owner->id,
            'status' => 'PENDING',
        ]);

        $this->getJson('/api/orders/' . $pendingOrder->id . '/invoice')
            ->assertStatus(422)
            ->assertJsonPath('message', 'Invoice is available only after fulfillment.');

        $fulfilledOrder = Order::factory()->create([
            'user_id' => $owner->id,
            'status' => 'FULFILLED',
        ]);

        OrderItem::factory()->create([
            'order_id' => $fulfilledOrder->id,
        ]);

        $response = $this->get('/api/orders/' . $fulfilledOrder->id . '/invoice');
        $response->assertOk();
        $this->assertStringContainsString(
            'invoice_' . $fulfilledOrder->id . '.pdf',
            (string) $response->headers->get('content-disposition')
        );
        $this->assertStringContainsString(
            'application/pdf',
            (string) $response->headers->get('content-type')
        );
    }

    public function test_stripe_webhook_marks_order_paid_on_checkout_completed(): void
    {
        Mail::fake();

        $owner = $this->createUser('wholesaler');
        $order = Order::factory()->create([
            'user_id' => $owner->id,
            'payment_method' => 'ONLINE',
            'payment_status' => 'PENDING',
            'stripe_checkout_session_id' => 'cs_test_paid_001',
        ]);

        $payload = [
            'type' => 'checkout.session.completed',
            'data' => [
                'object' => [
                    'id' => 'cs_test_paid_001',
                    'payment_status' => 'paid',
                    'metadata' => [
                        'order_id' => (string) $order->id,
                    ],
                ],
            ],
        ];

        $this->postJson('/api/orders/stripe/webhook', $payload)
            ->assertOk()
            ->assertJsonPath('received', true);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'payment_status' => 'PAID',
        ]);

        Mail::assertSent(TransactionalMail::class, 1);
    }

    public function test_stripe_webhook_marks_order_failed_on_checkout_expired(): void
    {
        Mail::fake();

        $owner = $this->createUser('wholesaler');
        $order = Order::factory()->create([
            'user_id' => $owner->id,
            'payment_method' => 'ONLINE',
            'payment_status' => 'PENDING',
            'stripe_checkout_session_id' => 'cs_test_failed_001',
        ]);

        $payload = [
            'type' => 'checkout.session.expired',
            'data' => [
                'object' => [
                    'id' => 'cs_test_failed_001',
                    'metadata' => [
                        'order_id' => (string) $order->id,
                    ],
                ],
            ],
        ];

        $this->postJson('/api/orders/stripe/webhook', $payload)
            ->assertOk()
            ->assertJsonPath('received', true);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'payment_status' => 'FAILED',
        ]);

        Mail::assertSent(TransactionalMail::class, 1);
    }
}
