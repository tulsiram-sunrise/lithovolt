<?php

namespace Tests\Feature\Api;

use App\Models\Order;
use App\Models\Warranty;
use App\Models\BatteryModel;
use App\Models\WarrantyClaim;

class AdminControllerTest extends ApiTestCase
{
    public function test_dashboard_requires_admin(): void
    {
        $user = $this->createUser('customer');
        $this->actingAsUser($user);

        $this->getJson('/api/v1/admin/dashboard')->assertStatus(403);
    }

    public function test_dashboard_returns_stats_for_admin(): void
    {
        $admin = $this->createUser('admin');
        BatteryModel::factory()->create();
        Order::factory()->create(['user_id' => $admin->id]);
        Warranty::factory()->create(['user_id' => $admin->id]);
        WarrantyClaim::factory()->create(['user_id' => $admin->id]);

        $this->actingAsUser($admin);

        $this->getJson('/api/v1/admin/dashboard')
            ->assertOk()
            ->assertJsonStructure(['stats', 'recent_orders', 'recent_claims']);
    }

    public function test_user_stats_returns_counts(): void
    {
        $admin = $this->createUser('admin');
        $this->actingAsUser($admin);

        $this->getJson('/api/v1/admin/users/stats')
            ->assertOk()
            ->assertJsonStructure(['total', 'verified', 'unverified', 'by_role']);
    }

    public function test_order_stats_returns_counts(): void
    {
        $admin = $this->createUser('admin');
        Order::factory()->count(2)->create(['user_id' => $admin->id]);
        $this->actingAsUser($admin);

        $this->getJson('/api/v1/admin/orders/stats')
            ->assertOk()
            ->assertJsonStructure(['total', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled']);
    }

    public function test_warranty_stats_returns_counts(): void
    {
        $admin = $this->createUser('admin');
        Warranty::factory()->count(2)->create(['user_id' => $admin->id]);
        $this->actingAsUser($admin);

        $this->getJson('/api/v1/admin/warranties/stats')
            ->assertOk()
            ->assertJsonStructure(['total', 'active', 'expired', 'claimed']);
    }

    public function test_export_data_returns_payload(): void
    {
        $admin = $this->createUser('admin');
        $this->actingAsUser($admin);

        $this->getJson('/api/v1/admin/export/users')
            ->assertOk();
    }
}
