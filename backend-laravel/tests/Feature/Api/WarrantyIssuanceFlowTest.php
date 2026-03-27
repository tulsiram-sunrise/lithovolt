<?php

namespace Tests\Feature\Api;

use App\Models\BatteryModel;
use App\Models\Product;
use App\Models\SerialNumber;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WarrantyIssuanceFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_serial_issue_verify_flow_marks_serial_sold(): void
    {
        $actor = User::factory()->create();

        $battery = BatteryModel::factory()->create([
            'warranty_months' => 24,
        ]);

        $product = Product::create([
            'name' => 'Test Battery Product',
            'product_type' => 'BATTERY',
            'sku' => 'TEST-BAT-' . now()->timestamp,
            'legacy_battery_model_id' => $battery->id,
            'description' => 'Test product for warranty issue flow',
            'price' => 1999,
            'total_quantity' => 10,
            'available_quantity' => 10,
            'low_stock_threshold' => 2,
            'is_active' => true,
            'is_serialized' => true,
            'is_warranty_eligible' => true,
            'is_fitment_eligible' => true,
            'default_warranty_months' => 24,
            'metadata' => [],
        ]);

        $serial = SerialNumber::create([
            'battery_model_id' => $battery->id,
            'product_id' => $product->id,
            'serial_number' => 'LV-TEST-' . now()->timestamp,
            'status' => 'unallocated',
        ]);

        $issuePayload = [
            'serial_number' => $serial->serial_number,
            'consumer_email' => 'flow.' . now()->timestamp . '@example.com',
            'consumer_first_name' => 'Flow',
            'consumer_last_name' => 'Customer',
        ];

        $issueResponse = $this->actingAs($actor, 'jwt')
            ->postJson('/api/warranties/', $issuePayload);

        $issueResponse
            ->assertCreated()
            ->assertJsonPath('message', 'Warranty issued successfully')
            ->assertJsonPath('warranty.serial_number', $serial->serial_number)
            ->assertJsonPath('warranty.product_id', $product->id)
            ->assertJsonPath('warranty.product_name', $product->name);

        $this->assertDatabaseHas('warranties', [
            'serial_number' => $serial->serial_number,
            'product_id' => $product->id,
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('users', [
            'email' => $issuePayload['consumer_email'],
        ]);
        $consumer = User::where('email', $issuePayload['consumer_email'])->firstOrFail();

        $serial->refresh();
        $this->assertDatabaseHas('serial_numbers', [
            'id' => $serial->id,
            'status' => 'sold',
            'sold_to' => $consumer->id,
        ]);

        $this->actingAs($actor, 'jwt')
            ->getJson('/api/warranties/verify/' . $serial->serial_number . '/')
            ->assertOk()
            ->assertJsonPath('valid', true)
            ->assertJsonPath('warranty.serial_number', $serial->serial_number)
            ->assertJsonPath('warranty.product_id', $product->id)
            ->assertJsonPath('warranty.product_name', $product->name);
    }
}
