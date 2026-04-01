<?php

namespace Database\Seeders;

use App\Models\CatalogItem;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CatalogTestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Test Batteries
        $batteries = [
            [
                'type' => 'BATTERY',
                'sku' => 'TEST-BAT-001',
                'name' => 'Test Battery 48V 100Ah LiFePO4',
                'slug' => 'test-battery-48v-100ah-lifepo4',
                'description' => 'Test LiFePO4 battery with 48V and 100Ah capacity',
                'price' => 2500.00,
                'total_quantity' => 50,
                'available_quantity' => 50,
                'is_active' => true,
                'is_serialized' => true,
                'is_warranty_eligible' => true,
                'is_fitment_eligible' => true,
                'is_returnable' => true,
                'default_warranty_months' => 60,
                'voltage_nominal' => 48,
                'capacity_ah' => 100,
                'capacity_wh' => 4800,
                'chemistry' => 'LiFePO4',
                'battery_type' => 'LITHIUM_ION',
                'brand' => 'LithoVolt',
                'series' => 'Test Series',
                'model_code' => 'TEST-LV-48-100',
                'maintenance_free' => true,
                'bms_included' => true,
            ],
            [
                'type' => 'BATTERY',
                'sku' => 'TEST-BAT-002',
                'name' => 'Test Battery 12V 200Ah Lead Acid',
                'slug' => 'test-battery-12v-200ah-lead-acid',
                'description' => 'Test Lead-acid starter battery',
                'price' => 500.00,
                'total_quantity' => 100,
                'available_quantity' => 95,
                'is_active' => true,
                'is_serialized' => true,
                'is_warranty_eligible' => true,
                'is_fitment_eligible' => true,
                'is_returnable' => true,
                'default_warranty_months' => 24,
                'voltage_nominal' => 12,
                'capacity_ah' => 200,
                'capacity_wh' => 2400,
                'chemistry' => 'LEAD_ACID',
                'battery_type' => 'STARTER',
                'brand' => 'TestBrand',
                'series' => 'Premium',
                'model_code' => 'TB-12-200',
                'maintenance_free' => false,
                'bms_included' => false,
            ],
        ];

        foreach ($batteries as $battery) {
            CatalogItem::updateOrCreate(
                ['sku' => $battery['sku']],
                $battery
            );
        }

        // Test Accessories
        $accessories = [
            [
                'type' => 'ACCESSORY',
                'sku' => 'TEST-ACC-001',
                'name' => 'Test Battery Cable Set',
                'slug' => 'test-battery-cable-set',
                'description' => 'Heavy-duty battery cable set for connections',
                'price' => 45.00,
                'total_quantity' => 200,
                'available_quantity' => 200,
                'is_active' => true,
                'is_serialized' => false,
                'is_warranty_eligible' => false,
                'is_fitment_eligible' => true,
                'is_returnable' => true,
                'default_warranty_months' => 12,
            ],
            [
                'type' => 'ACCESSORY',
                'sku' => 'TEST-ACC-002',
                'name' => 'Test Battery Terminal Covers',
                'slug' => 'test-battery-terminal-covers',
                'description' => 'Protective covers for battery terminals',
                'price' => 15.00,
                'total_quantity' => 500,
                'available_quantity' => 500,
                'is_active' => true,
                'is_serialized' => false,
                'is_warranty_eligible' => false,
                'is_fitment_eligible' => true,
                'is_returnable' => true,
                'default_warranty_months' => 6,
            ],
        ];

        foreach ($accessories as $accessory) {
            CatalogItem::updateOrCreate(
                ['sku' => $accessory['sku']],
                $accessory
            );
        }

        // Test Other Product Types
        $parts = [
            [
                'type' => 'PART',
                'sku' => 'TEST-PART-001',
                'name' => 'Test BMS Module',
                'slug' => 'test-bms-module',
                'description' => 'Battery Management System module for testing',
                'price' => 150.00,
                'total_quantity' => 50,
                'available_quantity' => 50,
                'is_active' => true,
                'is_serialized' => false,
                'is_warranty_eligible' => true,
                'is_fitment_eligible' => false,
                'is_returnable' => true,
                'default_warranty_months' => 36,
            ],
        ];

        foreach ($parts as $part) {
            CatalogItem::updateOrCreate(
                ['sku' => $part['sku']],
                $part
            );
        }

        echo "Test data seeded successfully!\n";
        echo "- Created 2 test batteries\n";
        echo "- Created 2 test accessories\n";
        echo "- Created 1 test part\n";
        echo "Total: 5 test catalog items\n";
    }
}
