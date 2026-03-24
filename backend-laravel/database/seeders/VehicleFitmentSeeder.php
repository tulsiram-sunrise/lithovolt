<?php

namespace Database\Seeders;

use App\Models\BatteryModel;
use App\Models\VehicleFitment;
use App\Models\VehicleFitmentRecommendation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VehicleFitmentSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('registration_lookup_cache')->delete();
        DB::table('vehicle_fitment_recommendations')->delete();
        DB::table('vehicle_fitments')->delete();

        $fitments = [
            [
                'vehicle' => [
                    'market' => 'AU',
                    'make' => 'TOYOTA',
                    'model' => 'HILUX',
                    'variant' => '2.8D',
                    'year_from' => 2017,
                    'year_to' => 2024,
                    'fuel_type' => 'Diesel',
                    'body_type' => 'Ute',
                ],
                'recommendations' => [
                    ['sku' => 'MF95D31R', 'type' => 'PRIMARY', 'priority' => 1],
                    ['sku' => 'MF95D31L', 'type' => 'ALTERNATE', 'priority' => 2],
                ],
            ],
            [
                'vehicle' => [
                    'market' => 'AU',
                    'make' => 'FORD',
                    'model' => 'RANGER',
                    'variant' => '3.2D',
                    'year_from' => 2016,
                    'year_to' => 2022,
                    'fuel_type' => 'Diesel',
                    'body_type' => 'Ute',
                ],
                'recommendations' => [
                    ['sku' => 'MF95D31R', 'type' => 'PRIMARY', 'priority' => 1],
                    ['sku' => 'SMFN70ZZX', 'type' => 'ALTERNATE', 'priority' => 2],
                ],
            ],
            [
                'vehicle' => [
                    'market' => 'AU',
                    'make' => 'FORD',
                    'model' => 'EVEREST',
                    'variant' => '2.0D',
                    'year_from' => 2019,
                    'year_to' => 2025,
                    'fuel_type' => 'Diesel',
                    'body_type' => 'SUV',
                ],
                'recommendations' => [
                    ['sku' => 'MF95D31R', 'type' => 'PRIMARY', 'priority' => 1],
                    ['sku' => 'SMFN70ZZX', 'type' => 'ALTERNATE', 'priority' => 2],
                ],
            ],
            [
                'vehicle' => [
                    'market' => 'AU',
                    'make' => 'MAZDA',
                    'model' => 'CX-5',
                    'variant' => '2.5',
                    'year_from' => 2018,
                    'year_to' => 2024,
                    'fuel_type' => 'Petrol',
                    'body_type' => 'SUV',
                ],
                'recommendations' => [
                    ['sku' => 'MF77HEF', 'type' => 'PRIMARY', 'priority' => 1],
                    ['sku' => 'MF77HSS', 'type' => 'ALTERNATE', 'priority' => 2],
                ],
            ],
            [
                'vehicle' => [
                    'market' => 'AU',
                    'make' => 'MAZDA',
                    'model' => 'BT-50',
                    'variant' => '3.0D',
                    'year_from' => 2021,
                    'year_to' => 2025,
                    'fuel_type' => 'Diesel',
                    'body_type' => 'Ute',
                ],
                'recommendations' => [
                    ['sku' => 'MF95D31R', 'type' => 'PRIMARY', 'priority' => 1],
                    ['sku' => 'SMFN70ZZLX', 'type' => 'ALTERNATE', 'priority' => 2],
                ],
            ],
            [
                'vehicle' => [
                    'market' => 'AU',
                    'make' => 'HYUNDAI',
                    'model' => 'I30',
                    'variant' => '1.6',
                    'year_from' => 2018,
                    'year_to' => 2024,
                    'fuel_type' => 'Petrol',
                    'body_type' => 'Hatch',
                ],
                'recommendations' => [
                    ['sku' => 'MFD23EF', 'type' => 'PRIMARY', 'priority' => 1],
                    ['sku' => 'MFB24EF', 'type' => 'ALTERNATE', 'priority' => 2],
                ],
            ],
            [
                'vehicle' => [
                    'market' => 'AU',
                    'make' => 'KIA',
                    'model' => 'CERATO',
                    'variant' => '2.0',
                    'year_from' => 2019,
                    'year_to' => 2025,
                    'fuel_type' => 'Petrol',
                    'body_type' => 'Sedan',
                ],
                'recommendations' => [
                    ['sku' => 'MFB24EF', 'type' => 'PRIMARY', 'priority' => 1],
                    ['sku' => 'MFD23EF', 'type' => 'ALTERNATE', 'priority' => 2],
                ],
            ],
            [
                'vehicle' => [
                    'market' => 'AU',
                    'make' => 'TOYOTA',
                    'model' => 'COROLLA',
                    'variant' => '1.8',
                    'year_from' => 2017,
                    'year_to' => 2024,
                    'fuel_type' => 'Petrol',
                    'body_type' => 'Sedan',
                ],
                'recommendations' => [
                    ['sku' => 'NS50P', 'type' => 'PRIMARY', 'priority' => 1],
                    ['sku' => 'MF55', 'type' => 'ALTERNATE', 'priority' => 2],
                ],
            ],
            [
                'vehicle' => [
                    'market' => 'AU',
                    'make' => 'TOYOTA',
                    'model' => 'RAV4',
                    'variant' => '2.5',
                    'year_from' => 2019,
                    'year_to' => 2025,
                    'fuel_type' => 'Hybrid',
                    'body_type' => 'SUV',
                ],
                'recommendations' => [
                    ['sku' => 'MF55', 'type' => 'PRIMARY', 'priority' => 1],
                    ['sku' => 'MFB24EF', 'type' => 'ALTERNATE', 'priority' => 2],
                ],
            ],
            [
                'vehicle' => [
                    'market' => 'AU',
                    'make' => 'TOYOTA',
                    'model' => 'PRADO',
                    'variant' => '2.8D',
                    'year_from' => 2016,
                    'year_to' => 2025,
                    'fuel_type' => 'Diesel',
                    'body_type' => 'SUV',
                ],
                'recommendations' => [
                    ['sku' => 'MF95D31R', 'type' => 'PRIMARY', 'priority' => 1],
                    ['sku' => 'MF95D31L', 'type' => 'ALTERNATE', 'priority' => 2],
                ],
            ],
            [
                'vehicle' => [
                    'market' => 'AU',
                    'make' => 'TOYOTA',
                    'model' => 'LANDCRUISER',
                    'variant' => '4.5D',
                    'year_from' => 2012,
                    'year_to' => 2025,
                    'fuel_type' => 'Diesel',
                    'body_type' => 'SUV',
                ],
                'recommendations' => [
                    ['sku' => 'MFULD31R', 'type' => 'PRIMARY', 'priority' => 1],
                    ['sku' => 'MF95D31R', 'type' => 'ALTERNATE', 'priority' => 2],
                ],
            ],
            [
                'vehicle' => [
                    'market' => 'AU',
                    'make' => 'NISSAN',
                    'model' => 'NAVARA',
                    'variant' => '2.3D',
                    'year_from' => 2016,
                    'year_to' => 2025,
                    'fuel_type' => 'Diesel',
                    'body_type' => 'Ute',
                ],
                'recommendations' => [
                    ['sku' => 'MF80D26R', 'type' => 'PRIMARY', 'priority' => 1],
                    ['sku' => 'MF80D26L', 'type' => 'ALTERNATE', 'priority' => 2],
                ],
            ],
            [
                'vehicle' => [
                    'market' => 'AU',
                    'make' => 'MITSUBISHI',
                    'model' => 'TRITON',
                    'variant' => '2.4D',
                    'year_from' => 2016,
                    'year_to' => 2025,
                    'fuel_type' => 'Diesel',
                    'body_type' => 'Ute',
                ],
                'recommendations' => [
                    ['sku' => 'MFD26EF', 'type' => 'PRIMARY', 'priority' => 1],
                    ['sku' => 'MF80D26R', 'type' => 'ALTERNATE', 'priority' => 2],
                ],
            ],
            [
                'vehicle' => [
                    'market' => 'AU',
                    'make' => 'NISSAN',
                    'model' => 'PATROL',
                    'variant' => '4.0',
                    'year_from' => 2013,
                    'year_to' => 2025,
                    'fuel_type' => 'Petrol',
                    'body_type' => 'SUV',
                ],
                'recommendations' => [
                    ['sku' => 'N70ZZLX', 'type' => 'PRIMARY', 'priority' => 1],
                    ['sku' => 'MF95D31L', 'type' => 'ALTERNATE', 'priority' => 2],
                ],
            ],
            [
                'vehicle' => [
                    'market' => 'AU',
                    'make' => 'SUBARU',
                    'model' => 'FORESTER',
                    'variant' => '2.5',
                    'year_from' => 2019,
                    'year_to' => 2025,
                    'fuel_type' => 'Petrol',
                    'body_type' => 'SUV',
                ],
                'recommendations' => [
                    ['sku' => 'MF55', 'type' => 'PRIMARY', 'priority' => 1],
                    ['sku' => 'MF44H', 'type' => 'ALTERNATE', 'priority' => 2],
                ],
            ],
            [
                'vehicle' => [
                    'market' => 'AU',
                    'make' => 'VOLKSWAGEN',
                    'model' => 'GOLF',
                    'variant' => '1.4',
                    'year_from' => 2017,
                    'year_to' => 2025,
                    'fuel_type' => 'Petrol',
                    'body_type' => 'Hatch',
                ],
                'recommendations' => [
                    ['sku' => 'MF66', 'type' => 'PRIMARY', 'priority' => 1],
                    ['sku' => 'MF66HEF', 'type' => 'ALTERNATE', 'priority' => 2],
                ],
            ],
            [
                'vehicle' => [
                    'market' => 'AU',
                    'make' => 'BMW',
                    'model' => '320I',
                    'variant' => '2.0',
                    'year_from' => 2016,
                    'year_to' => 2025,
                    'fuel_type' => 'Petrol',
                    'body_type' => 'Sedan',
                ],
                'recommendations' => [
                    ['sku' => 'MF77HSS', 'type' => 'PRIMARY', 'priority' => 1],
                    ['sku' => 'MF77HEF', 'type' => 'ALTERNATE', 'priority' => 2],
                ],
            ],
            [
                'vehicle' => [
                    'market' => 'AU',
                    'make' => 'MERCEDES-BENZ',
                    'model' => 'C200',
                    'variant' => '2.0',
                    'year_from' => 2016,
                    'year_to' => 2025,
                    'fuel_type' => 'Petrol',
                    'body_type' => 'Sedan',
                ],
                'recommendations' => [
                    ['sku' => 'MF77HSS', 'type' => 'PRIMARY', 'priority' => 1],
                    ['sku' => 'MF66HEF', 'type' => 'ALTERNATE', 'priority' => 2],
                ],
            ],
            [
                'vehicle' => [
                    'market' => 'AU',
                    'make' => 'ISUZU',
                    'model' => 'D-MAX',
                    'variant' => '3.0D',
                    'year_from' => 2020,
                    'year_to' => 2025,
                    'fuel_type' => 'Diesel',
                    'body_type' => 'Ute',
                ],
                'recommendations' => [
                    ['sku' => 'MFULD31R', 'type' => 'PRIMARY', 'priority' => 1],
                    ['sku' => 'MFULD26L', 'type' => 'ALTERNATE', 'priority' => 2],
                ],
            ],
            [
                'vehicle' => [
                    'market' => 'AU',
                    'make' => 'HOLDEN',
                    'model' => 'COLORADO',
                    'variant' => '2.8D',
                    'year_from' => 2016,
                    'year_to' => 2021,
                    'fuel_type' => 'Diesel',
                    'body_type' => 'Ute',
                ],
                'recommendations' => [
                    ['sku' => 'MF95D31R', 'type' => 'PRIMARY', 'priority' => 1],
                    ['sku' => 'SMFN70ZZX', 'type' => 'ALTERNATE', 'priority' => 2],
                ],
            ],
        ];

        foreach ($fitments as $entry) {
            $fitment = VehicleFitment::create($entry['vehicle']);

            foreach ($entry['recommendations'] as $recommendation) {
                $battery = BatteryModel::where('sku', $recommendation['sku'])->first();
                if (!$battery) {
                    continue;
                }

                VehicleFitmentRecommendation::create([
                    'vehicle_fitment_id' => $fitment->id,
                    'battery_model_id' => $battery->id,
                    'recommendation_type' => $recommendation['type'],
                    'priority' => $recommendation['priority'],
                ]);
            }
        }
    }
}
