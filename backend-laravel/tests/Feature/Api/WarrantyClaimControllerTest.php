<?php

namespace Tests\Feature\Api;

use App\Models\Warranty;
use App\Models\WarrantyClaim;

class WarrantyClaimControllerTest extends ApiTestCase
{
    public function test_index_returns_claims(): void
    {
        $user = $this->createUser('admin');
        WarrantyClaim::factory()->count(2)->create();
        $this->actingAsUser($user);

        $this->getJson('/api/v1/warranty-claims')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_store_creates_claim(): void
    {
        $user = $this->createUser('admin');
        $warranty = Warranty::factory()->create();
        $customer = $this->createUser('customer');
        $this->actingAsUser($user);

        $response = $this->postJson('/api/v1/warranty-claims', [
            'warranty_id' => $warranty->id,
            'user_id' => $customer->id,
            'claim_number' => 'CLM-00001',
            'complaint_description' => 'Not charging',
            'status' => 'submitted',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('warranty_claims', ['claim_number' => 'CLM-00001']);
    }

    public function test_show_returns_claim(): void
    {
        $user = $this->createUser('admin');
        $claim = WarrantyClaim::factory()->create();
        $this->actingAsUser($user);

        $this->getJson('/api/v1/warranty-claims/' . $claim->id)
            ->assertOk()
            ->assertJsonPath('id', $claim->id);
    }

    public function test_update_modifies_claim(): void
    {
        $user = $this->createUser('admin');
        $claim = WarrantyClaim::factory()->create();
        $this->actingAsUser($user);

        $this->putJson('/api/v1/warranty-claims/' . $claim->id, [
            'status' => 'resolved',
            'resolution' => 'Replaced',
        ])->assertOk();

        $this->assertDatabaseHas('warranty_claims', ['id' => $claim->id, 'status' => 'resolved']);
    }

    public function test_destroy_deletes_claim(): void
    {
        $user = $this->createUser('admin');
        $claim = WarrantyClaim::factory()->create();
        $this->actingAsUser($user);

        $this->deleteJson('/api/v1/warranty-claims/' . $claim->id)
            ->assertOk();

        $this->assertDatabaseMissing('warranty_claims', ['id' => $claim->id]);
    }

    public function test_claims_by_warranty_returns_claims(): void
    {
        $user = $this->createUser('admin');
        $warranty = Warranty::factory()->create();
        WarrantyClaim::factory()->count(2)->create(['warranty_id' => $warranty->id]);
        $this->actingAsUser($user);

        $this->getJson('/api/v1/warranties/' . $warranty->id . '/claims')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }
}
