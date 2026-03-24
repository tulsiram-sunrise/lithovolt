<?php

namespace Tests\Feature\Api;

use Database\Seeders\BatteryModelSeeder;
use Database\Seeders\VehicleFitmentSeeder;
use Illuminate\Support\Facades\Http;

class VehicleFitmentControllerTest extends ApiTestCase
{
    public function test_registration_lookup_matches_with_manual_hint(): void
    {
        $this->seed([BatteryModelSeeder::class, VehicleFitmentSeeder::class]);

        $response = $this->postJson('/api/fitment/registration-lookup/', [
            'registration_number' => 'ABC-123',
            'manual' => [
                'make' => 'Toyota',
                'model' => 'Hilux',
                'year' => 2021,
            ],
        ]);

        $response->assertOk()
            ->assertJsonPath('lookup_status', 'matched')
            ->assertJsonPath('source', 'manual')
            ->assertJsonPath('vehicle.make', 'TOYOTA')
            ->assertJsonCount(2, 'recommendations');
    }

    public function test_registration_lookup_uses_cache_after_first_match(): void
    {
        $this->seed([BatteryModelSeeder::class, VehicleFitmentSeeder::class]);

        $this->postJson('/api/fitment/registration-lookup/', [
            'registration_number' => 'NSW 77X',
            'manual' => [
                'make' => 'Ford',
                'model' => 'Ranger',
                'year' => 2020,
            ],
        ])->assertOk();

        $second = $this->postJson('/api/fitment/registration-lookup/', [
            'registration_number' => 'NSW-77X',
        ]);

        $second->assertOk()
            ->assertJsonPath('lookup_status', 'matched')
            ->assertJsonPath('source', 'cache')
            ->assertJsonPath('vehicle.make', 'FORD');
    }

    public function test_registration_lookup_uses_http_provider_when_enabled(): void
    {
        $this->seed([BatteryModelSeeder::class, VehicleFitmentSeeder::class]);

        config()->set('registration_lookup.provider_enabled', true);
        config()->set('registration_lookup.provider_driver', 'http_json');
        config()->set('registration_lookup.provider_name', 'test_http_provider');
        config()->set('registration_lookup.http.url', 'https://provider.example/lookup');
        config()->set('registration_lookup.http.method', 'GET');

        Http::fake([
            'provider.example/*' => Http::response([
                'vehicle' => [
                    'make' => 'Toyota',
                    'model' => 'Hilux',
                    'year' => 2022,
                ],
            ], 200),
        ]);

        $response = $this->postJson('/api/fitment/registration-lookup/', [
            'registration_number' => 'XYZ999',
            'state_code' => 'NSW',
            'market' => 'AU',
        ]);

        $response->assertOk()
            ->assertJsonPath('lookup_status', 'matched')
            ->assertJsonPath('source', 'provider')
            ->assertJsonPath('feasibility.provider_connected', true)
            ->assertJsonPath('feasibility.provider_used', 'test_http_provider');

        Http::assertSentCount(1);
    }
}
