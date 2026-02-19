<?php

namespace Database\Seeders;

use App\Models\BatteryModel;
use Illuminate\Database\Seeder;

class BatteryModelSeeder extends Seeder
{
    public function run(): void
    {
        BatteryModel::create([
            'name' => 'LithoVolt Pro 48V 100Ah',
            'description' => 'Professional grade lithium battery 48V 100Ah',
            'sku' => 'LV-PRO-48-100',
            'voltage' => 48,
            'capacity' => 100,
            'chemistry' => 'LiFePO4',
            'total_quantity' => 100,
            'available_quantity' => 95,
            'price' => 8999.99,
            'warranty_months' => 60,
            'status' => 'active',
        ]);

        BatteryModel::create([
            'name' => 'LithoVolt Home 48V 50Ah',
            'description' => 'Home use lithium battery 48V 50Ah',
            'sku' => 'LV-HOME-48-50',
            'voltage' => 48,
            'capacity' => 50,
            'chemistry' => 'LiFePO4',
            'total_quantity' => 200,
            'available_quantity' => 180,
            'price' => 4999.99,
            'warranty_months' => 48,
            'status' => 'active',
        ]);

        BatteryModel::create([
            'name' => 'LithoVolt Max 96V 50Ah',
            'description' => 'High voltage lithium battery 96V 50Ah',
            'sku' => 'LV-MAX-96-50',
            'voltage' => 96,
            'capacity' => 50,
            'chemistry' => 'LiFePO4',
            'total_quantity' => 50,
            'available_quantity' => 45,
            'price' => 12999.99,
            'warranty_months' => 72,
            'status' => 'active',
        ]);

        BatteryModel::create([
            'name' => 'LithoVolt Lite 24V 30Ah',
            'description' => 'Light duty lithium battery 24V 30Ah',
            'sku' => 'LV-LITE-24-30',
            'voltage' => 24,
            'capacity' => 30,
            'chemistry' => 'LiFePO4',
            'total_quantity' => 300,
            'available_quantity' => 275,
            'price' => 2499.99,
            'warranty_months' => 36,
            'status' => 'active',
        ]);
    }
}
