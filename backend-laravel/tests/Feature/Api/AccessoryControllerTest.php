<?php

namespace Tests\Feature\Api;

use App\Models\Accessory;

class AccessoryControllerTest extends ApiTestCase
{
    public function test_index_returns_accessories(): void
    {
        $user = $this->createUser('admin');
        Accessory::factory()->count(2)->create();
        $this->actingAsUser($user);

        $this->getJson('/api/v1/accessories')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_store_creates_accessory(): void
    {
        $user = $this->createUser('admin');
        $this->actingAsUser($user);

        $response = $this->postJson('/api/v1/accessories', [
            'name' => 'Accessory A',
            'description' => 'Test accessory',
            'sku' => 'ACC-001',
            'total_quantity' => 50,
            'available_quantity' => 50,
            'price' => 199.99,
            'status' => 'active',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('accessories', ['sku' => 'ACC-001']);
    }

    public function test_show_returns_accessory(): void
    {
        $user = $this->createUser('admin');
        $accessory = Accessory::factory()->create();
        $this->actingAsUser($user);

        $this->getJson('/api/v1/accessories/' . $accessory->id)
            ->assertOk()
            ->assertJsonPath('id', $accessory->id);
    }

    public function test_update_modifies_accessory(): void
    {
        $user = $this->createUser('admin');
        $accessory = Accessory::factory()->create();
        $this->actingAsUser($user);

        $this->putJson('/api/v1/accessories/' . $accessory->id, [
            'name' => 'Updated Accessory',
        ])->assertOk();

        $this->assertDatabaseHas('accessories', ['id' => $accessory->id, 'name' => 'Updated Accessory']);
    }

    public function test_destroy_deletes_accessory(): void
    {
        $user = $this->createUser('admin');
        $accessory = Accessory::factory()->create();
        $this->actingAsUser($user);

        $this->deleteJson('/api/v1/accessories/' . $accessory->id)
            ->assertOk();

        $this->assertSoftDeleted('accessories', ['id' => $accessory->id]);
    }
}
