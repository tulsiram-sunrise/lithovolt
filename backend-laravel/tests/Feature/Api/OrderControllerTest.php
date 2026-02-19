<?php

namespace Tests\Feature\Api;

use App\Models\Order;

class OrderControllerTest extends ApiTestCase
{
    public function test_index_returns_orders(): void
    {
        $user = $this->createUser('admin');
        Order::factory()->count(2)->create(['user_id' => $user->id]);
        $this->actingAsUser($user);

        $this->getJson('/api/v1/orders')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_store_creates_order(): void
    {
        $user = $this->createUser('admin');
        $this->actingAsUser($user);

        $response = $this->postJson('/api/v1/orders', [
            'user_id' => $user->id,
            'order_number' => 'ORD-00001',
            'total_amount' => 1500,
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('orders', ['order_number' => 'ORD-00001']);
    }

    public function test_show_returns_order(): void
    {
        $user = $this->createUser('admin');
        $order = Order::factory()->create(['user_id' => $user->id]);
        $this->actingAsUser($user);

        $this->getJson('/api/v1/orders/' . $order->id)
            ->assertOk()
            ->assertJsonPath('id', $order->id);
    }

    public function test_update_modifies_order(): void
    {
        $user = $this->createUser('admin');
        $order = Order::factory()->create(['user_id' => $user->id]);
        $this->actingAsUser($user);

        $this->putJson('/api/v1/orders/' . $order->id, [
            'status' => 'confirmed',
        ])->assertOk();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'confirmed']);
    }

    public function test_destroy_deletes_order(): void
    {
        $user = $this->createUser('admin');
        $order = Order::factory()->create(['user_id' => $user->id]);
        $this->actingAsUser($user);

        $this->deleteJson('/api/v1/orders/' . $order->id)->assertOk();
        $this->assertSoftDeleted('orders', ['id' => $order->id]);
    }

    public function test_orders_by_user_returns_orders(): void
    {
        $user = $this->createUser('admin');
        Order::factory()->count(2)->create(['user_id' => $user->id]);
        $this->actingAsUser($user);

        $this->getJson('/api/v1/users/' . $user->id . '/orders')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }
}
