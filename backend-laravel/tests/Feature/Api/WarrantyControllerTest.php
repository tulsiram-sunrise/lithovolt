<?php

namespace Tests\Feature\Api;

use App\Models\Warranty;

class WarrantyControllerTest extends ApiTestCase
{
    public function test_index_returns_warranties(): void
    {
        $user = $this->createUser('admin');
        Warranty::factory()->count(2)->create();
        $this->actingAsUser($user);

        $this->getJson('/api/warranties')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_store_creates_warranty(): void
    {
        $user = $this->createUser('admin');
        $battery = \App\Models\BatteryModel::factory()->create();
        $customer = $this->createUser('customer');
        $this->actingAsUser($user);

        $response = $this->postJson('/api/warranties', [
            'warranty_number' => 'WAR-00001',
            'battery_model_id' => $battery->id,
            'user_id' => $customer->id,
            'serial_number' => 'SN-00000001',
            'issue_date' => now()->toDateString(),
            'expiry_date' => now()->addYear()->toDateString(),
            'status' => 'active',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('warranties', ['warranty_number' => 'WAR-00001']);
    }

    public function test_show_returns_warranty(): void
    {
        $user = $this->createUser('admin');
        $warranty = Warranty::factory()->create();
        $this->actingAsUser($user);

        $this->getJson('/api/warranties/' . $warranty->id)
            ->assertOk()
            ->assertJsonPath('id', $warranty->id);
    }

    public function test_update_modifies_warranty(): void
    {
        $user = $this->createUser('admin');
        $warranty = Warranty::factory()->create();
        $this->actingAsUser($user);

        $this->putJson('/api/warranties/' . $warranty->id, [
            'status' => 'expired',
        ])->assertOk();

        $this->assertDatabaseHas('warranties', ['id' => $warranty->id, 'status' => 'expired']);
    }

    public function test_destroy_deletes_warranty(): void
    {
        $user = $this->createUser('admin');
        $warranty = Warranty::factory()->create();
        $this->actingAsUser($user);

        $this->deleteJson('/api/warranties/' . $warranty->id)
            ->assertOk();

        $this->assertDatabaseMissing('warranties', ['id' => $warranty->id]);
    }

    public function test_validate_qr_code_returns_warranty(): void
    {
        $user = $this->createUser('admin');
        $warranty = Warranty::factory()->create(['serial_number' => 'SN-VERIFY-001']);
        $this->actingAsUser($user);

        $this->getJson('/api/warranties/verify/SN-VERIFY-001')
            ->assertOk()
            ->assertJsonPath('valid', true);
    }

    public function test_public_verify_works_without_auth_and_hides_consumer_identity(): void
    {
        Warranty::factory()->create(['serial_number' => 'SN-PUBLIC-VERIFY-001']);

        $this->getJson('/api/warranties/verify/SN-PUBLIC-VERIFY-001')
            ->assertOk()
            ->assertJsonPath('valid', true)
            ->assertJsonMissingPath('warranty.consumer_email')
            ->assertJsonMissingPath('warranty.consumer_name');
    }
}
