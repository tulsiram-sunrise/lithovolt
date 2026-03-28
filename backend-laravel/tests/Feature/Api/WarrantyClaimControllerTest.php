<?php

namespace Tests\Feature\Api;

use App\Models\Warranty;
use App\Models\WarrantyClaim;

class WarrantyClaimControllerTest extends ApiTestCase
{
    public function test_index_returns_claims(): void
    {
        $user = $this->actingAsBackofficeAdmin();
        WarrantyClaim::factory()->count(2)->create();

        $this->getJson('/api/warranty-claims')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_store_creates_claim(): void
    {
        $this->actingAsBackofficeAdmin();
        $customer = $this->createUser('customer');
        $warranty = Warranty::factory()->create([
            'user_id' => $customer->id,
        ]);

        $response = $this->postJson('/api/warranty-claims', [
            'warranty_id' => $warranty->id,
            'user_id' => $customer->id,
            'claim_number' => 'CLM-00001',
            'complaint_description' => 'Not charging',
            'status' => 'PENDING',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('warranty_claims', ['claim_number' => 'CLM-00001']);
    }

    public function test_show_returns_claim(): void
    {
        $this->actingAsBackofficeAdmin();
        $claim = WarrantyClaim::factory()->create();

        $this->getJson('/api/warranty-claims/' . $claim->id)
            ->assertOk()
            ->assertJsonPath('id', $claim->id);
    }

    public function test_update_modifies_claim(): void
    {
        $this->actingAsBackofficeAdmin();
        $claim = WarrantyClaim::factory()->create([
            'status' => 'PENDING',
        ]);

        $this->putJson('/api/warranty-claims/' . $claim->id, [
            'status' => 'UNDER_REVIEW',
            'resolution' => 'Review started',
        ])->assertOk();

        $this->assertDatabaseHas('warranty_claims', ['id' => $claim->id, 'status' => 'UNDER_REVIEW']);
    }

    public function test_destroy_deletes_claim(): void
    {
        $this->actingAsBackofficeAdmin();
        $claim = WarrantyClaim::factory()->create();

        $this->deleteJson('/api/warranty-claims/' . $claim->id)
            ->assertOk();

        $this->assertDatabaseMissing('warranty_claims', ['id' => $claim->id]);
    }

    public function test_claims_by_warranty_returns_claims(): void
    {
        $this->actingAsBackofficeAdmin();
        $warranty = Warranty::factory()->create();
        WarrantyClaim::factory()->count(2)->create(['warranty_id' => $warranty->id]);

        $this->getJson('/api/warranty-claims/warranty/' . $warranty->id)
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_update_rejects_invalid_status_transition(): void
    {
        $this->actingAsBackofficeAdmin();
        $claim = WarrantyClaim::factory()->create([
            'status' => 'RESOLVED',
        ]);

        $this->putJson('/api/warranty-claims/' . $claim->id, [
            'status' => 'APPROVED',
        ])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Cannot transition from RESOLVED to APPROVED');
    }

    public function test_non_owner_cannot_update_claim(): void
    {
        $customerRole = $this->createRole('customer');
        $owner = \App\Models\User::factory()->create(['role_id' => $customerRole->id]);
        $warranty = Warranty::factory()->create(['user_id' => $owner->id]);
        $claim = WarrantyClaim::factory()->create([
            'warranty_id' => $warranty->id,
            'user_id' => $owner->id,
            'status' => 'PENDING',
        ]);

        $otherUser = \App\Models\User::factory()->create(['role_id' => $customerRole->id]);
        $this->actingAsUser($otherUser);

        $this->putJson('/api/warranty-claims/' . $claim->id, [
            'status' => 'UNDER_REVIEW',
        ])
            ->assertStatus(403)
            ->assertJsonPath('message', 'Forbidden');
    }
}
