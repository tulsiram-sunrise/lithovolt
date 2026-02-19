<?php

namespace Tests\Feature\Api;

use App\Models\BatteryModel;

class BatteryModelControllerTest extends ApiTestCase
{
    public function test_index_returns_batteries(): void
    {
        $user = $this->createUser('admin');
        BatteryModel::factory()->count(2)->create();

        $this->actingAsUser($user);

        $this->getJson('/api/v1/battery-models')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_store_creates_battery(): void
    {
        $user = $this->createUser('admin');
        $this->actingAsUser($user);

        $response = $this->postJson('/api/v1/battery-models', [
            'name' => 'LithoVolt X',
            'description' => 'Test model',
            'sku' => 'LV-X-001',
            'voltage' => 48,
            'capacity' => 100,
            'chemistry' => 'LiFePO4',
            'total_quantity' => 10,
            'available_quantity' => 10,
            'price' => 9999.99,
            'warranty_months' => 60,
            'status' => 'active',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('battery_models', ['sku' => 'LV-X-001']);
    }

    public function test_show_returns_battery(): void
    {
        $user = $this->createUser('admin');
        $battery = BatteryModel::factory()->create();
        $this->actingAsUser($user);

        $this->getJson('/api/v1/battery-models/' . $battery->id)
            ->assertOk()
            ->assertJsonPath('id', $battery->id);
    }

    public function test_update_modifies_battery(): void
    {
        $user = $this->createUser('admin');
        $battery = BatteryModel::factory()->create();
        $this->actingAsUser($user);

        $this->putJson('/api/v1/battery-models/' . $battery->id, [
            'name' => 'Updated Battery',
        ])->assertOk();

        $this->assertDatabaseHas('battery_models', ['id' => $battery->id, 'name' => 'Updated Battery']);
    }

    public function test_destroy_deletes_battery(): void
    {
        $user = $this->createUser('admin');
        $battery = BatteryModel::factory()->create();
        $this->actingAsUser($user);

        $this->deleteJson('/api/v1/battery-models/' . $battery->id)
            ->assertOk();

        $this->assertSoftDeleted('battery_models', ['id' => $battery->id]);
    }
}
