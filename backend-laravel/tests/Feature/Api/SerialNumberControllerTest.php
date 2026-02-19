<?php

namespace Tests\Feature\Api;

use App\Models\SerialNumber;

class SerialNumberControllerTest extends ApiTestCase
{
    public function test_index_returns_serials(): void
    {
        $user = $this->createUser('admin');
        SerialNumber::factory()->count(2)->create();
        $this->actingAsUser($user);

        $this->getJson('/api/v1/serial-numbers')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_store_creates_serial(): void
    {
        $user = $this->createUser('admin');
        $battery = \App\Models\BatteryModel::factory()->create();
        $this->actingAsUser($user);

        $response = $this->postJson('/api/v1/serial-numbers', [
            'battery_model_id' => $battery->id,
            'serial_number' => 'SN-12345678',
            'status' => 'unallocated',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('serial_numbers', ['serial_number' => 'SN-12345678']);
    }

    public function test_show_returns_serial(): void
    {
        $user = $this->createUser('admin');
        $serial = SerialNumber::factory()->create();
        $this->actingAsUser($user);

        $this->getJson('/api/v1/serial-numbers/' . $serial->id)
            ->assertOk()
            ->assertJsonPath('id', $serial->id);
    }

    public function test_update_modifies_serial(): void
    {
        $user = $this->createUser('admin');
        $serial = SerialNumber::factory()->create();
        $this->actingAsUser($user);

        $this->putJson('/api/v1/serial-numbers/' . $serial->id, [
            'status' => 'allocated',
        ])->assertOk();

        $this->assertDatabaseHas('serial_numbers', ['id' => $serial->id, 'status' => 'allocated']);
    }

    public function test_allocate_marks_allocated(): void
    {
        $user = $this->createUser('admin');
        $serial = SerialNumber::factory()->create();
        $allocatedTo = $this->createUser('customer');
        $this->actingAsUser($user);

        $this->postJson('/api/v1/serial-numbers/' . $serial->id . '/allocate', [
            'allocated_to' => $allocatedTo->id,
        ])->assertOk();

        $this->assertDatabaseHas('serial_numbers', ['id' => $serial->id, 'status' => 'allocated']);
    }

    public function test_mark_sold_marks_sold(): void
    {
        $user = $this->createUser('admin');
        $serial = SerialNumber::factory()->create();
        $soldTo = $this->createUser('customer');
        $this->actingAsUser($user);

        $this->postJson('/api/v1/serial-numbers/' . $serial->id . '/mark-sold', [
            'sold_to' => $soldTo->id,
        ])->assertOk();

        $this->assertDatabaseHas('serial_numbers', ['id' => $serial->id, 'status' => 'sold']);
    }

    public function test_destroy_deletes_serial(): void
    {
        $user = $this->createUser('admin');
        $serial = SerialNumber::factory()->create();
        $this->actingAsUser($user);

        $this->deleteJson('/api/v1/serial-numbers/' . $serial->id)
            ->assertOk();

        $this->assertDatabaseMissing('serial_numbers', ['id' => $serial->id]);
    }
}
