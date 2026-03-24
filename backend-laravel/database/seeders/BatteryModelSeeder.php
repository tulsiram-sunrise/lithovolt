<?php

namespace Database\Seeders;

use App\Models\BatteryModel;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BatteryModelSeeder extends Seeder
{
    private function normalizeSeries(string $sourceSeries): string
    {
        return match ($sourceSeries) {
            'GoldPlus' => 'LV Premium',
            'SilverPlus' => 'LV Plus',
            'Classic' => 'LV Standard',
            'Gladiator' => 'LV Heavy Duty',
            'Stop-Start' => 'LV Start-Stop',
            default => 'LV Automotive',
        };
    }

    private function baseRecord(array $row): array
    {
        $warranty = $row['private_warranty_months'] ?? 24;
        $sourceSeries = $row['series'];
        $businessSeries = $this->normalizeSeries($sourceSeries);

        return [
            'name' => 'LithoVolt ' . $businessSeries . ' ' . $row['sku'],
            'brand' => 'LithoVolt',
            'series' => $businessSeries,
            'description' => 'Market-reference specification model ' . $row['sku'] . ' (' . $row['battery_type'] . ')',
            'sku' => $row['sku'],
            'model_code' => $row['sku'],
            'group_size' => $row['group_size'],
            'voltage' => $row['voltage'] ?? 12,
            'capacity' => $row['capacity_ah'],
            'chemistry' => $row['battery_type'],
            'battery_type' => $row['battery_type'],
            'cca' => $row['cca'],
            'reserve_capacity' => $row['reserve_capacity'],
            'capacity_ah' => $row['capacity_ah'],
            'length_mm' => $row['length_mm'],
            'width_mm' => $row['width_mm'],
            'height_mm' => $row['height_mm'],
            'total_height_mm' => $row['total_height_mm'],
            'terminal_type' => $row['terminal_type'],
            'terminal_layout' => $row['terminal_layout'],
            'hold_down' => $row['hold_down'],
            'vent_type' => $row['vent_type'],
            'maintenance_free' => $row['maintenance_free'],
            'private_warranty_months' => $row['private_warranty_months'],
            'commercial_warranty_months' => $row['commercial_warranty_months'],
            'unit_weight_kg' => $row['unit_weight_kg'],
            'application_segment' => $row['application_segment'],
            'specs' => [
                'source' => 'public_market_reference',
                'source_series' => $sourceSeries,
                'branding_note' => 'Model codes are retained for compatibility; product branding is LithoVolt.',
            ],
            'total_quantity' => 0,
            'available_quantity' => 0,
            'price' => 0,
            'status' => 'active',
            'warranty_months' => $warranty,
        ];
    }

    public function run(): void
    {
        // Keep this deterministic and clean on every seed run.
        DB::table('battery_models')->delete();

        $catalog = [
            // GoldPlus
            [
                'series' => 'GoldPlus',
                'application_segment' => '4WD, SUV, Truck & Industrial Applications',
                'sku' => 'MF80D26R', 'group_size' => 'NS70', 'battery_type' => 'SMF CAL',
                'cca' => 750, 'reserve_capacity' => 150, 'capacity_ah' => 85,
                'length_mm' => 259, 'width_mm' => 174, 'height_mm' => 202, 'total_height_mm' => 223,
                'terminal_type' => 'STD', 'terminal_layout' => 'D', 'hold_down' => 'FL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 40, 'commercial_warranty_months' => null, 'unit_weight_kg' => 18,
            ],
            [
                'series' => 'GoldPlus',
                'application_segment' => '4WD, SUV, Truck & Industrial Applications',
                'sku' => 'MF80D26L', 'group_size' => 'NS70', 'battery_type' => 'SMF CAL',
                'cca' => 750, 'reserve_capacity' => 150, 'capacity_ah' => 85,
                'length_mm' => 259, 'width_mm' => 174, 'height_mm' => 202, 'total_height_mm' => 223,
                'terminal_type' => 'STD', 'terminal_layout' => 'C', 'hold_down' => 'FL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 40, 'commercial_warranty_months' => null, 'unit_weight_kg' => 18,
            ],
            [
                'series' => 'GoldPlus',
                'application_segment' => '4WD, SUV, Truck & Industrial Applications',
                'sku' => 'MF95D31R', 'group_size' => 'N70', 'battery_type' => 'SMF CAL',
                'cca' => 850, 'reserve_capacity' => 180, 'capacity_ah' => 95,
                'length_mm' => 304, 'width_mm' => 174, 'height_mm' => 203, 'total_height_mm' => 224,
                'terminal_type' => 'STD', 'terminal_layout' => 'D', 'hold_down' => 'FL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 40, 'commercial_warranty_months' => null, 'unit_weight_kg' => 18,
            ],
            [
                'series' => 'GoldPlus',
                'application_segment' => '4WD, SUV, Truck & Industrial Applications',
                'sku' => 'MF95D31L', 'group_size' => 'N70', 'battery_type' => 'SMF CAL',
                'cca' => 850, 'reserve_capacity' => 180, 'capacity_ah' => 95,
                'length_mm' => 304, 'width_mm' => 174, 'height_mm' => 203, 'total_height_mm' => 224,
                'terminal_type' => 'STD', 'terminal_layout' => 'C', 'hold_down' => 'FL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 40, 'commercial_warranty_months' => null, 'unit_weight_kg' => 18,
            ],

            // GoldPlus - European/Popular/Japanese automotive
            [
                'series' => 'GoldPlus',
                'application_segment' => 'European Automotive',
                'sku' => 'MF44H', 'group_size' => 'N44H', 'battery_type' => 'SMF CAL',
                'cca' => 420, 'reserve_capacity' => 72, 'capacity_ah' => 45,
                'length_mm' => 208, 'width_mm' => 174, 'height_mm' => 190, 'total_height_mm' => 190,
                'terminal_type' => 'STD', 'terminal_layout' => 'C', 'hold_down' => 'EL & FL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 40, 'commercial_warranty_months' => 50, 'unit_weight_kg' => 18,
            ],
            [
                'series' => 'GoldPlus',
                'application_segment' => 'European Automotive',
                'sku' => 'MF55', 'group_size' => 'N55', 'battery_type' => 'SMF CAL',
                'cca' => 640, 'reserve_capacity' => 105, 'capacity_ah' => 62,
                'length_mm' => 242, 'width_mm' => 175, 'height_mm' => 175, 'total_height_mm' => 175,
                'terminal_type' => 'STD', 'terminal_layout' => 'C', 'hold_down' => 'EL & FL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 40, 'commercial_warranty_months' => 50, 'unit_weight_kg' => 18,
            ],
            [
                'series' => 'GoldPlus',
                'application_segment' => 'European Automotive',
                'sku' => 'MF66', 'group_size' => 'N66', 'battery_type' => 'SMF CAL',
                'cca' => 760, 'reserve_capacity' => 130, 'capacity_ah' => 80,
                'length_mm' => 277, 'width_mm' => 175, 'height_mm' => 175, 'total_height_mm' => 175,
                'terminal_type' => 'STD', 'terminal_layout' => 'C', 'hold_down' => 'EL & FL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 40, 'commercial_warranty_months' => 50, 'unit_weight_kg' => 18,
            ],
            [
                'series' => 'GoldPlus',
                'application_segment' => 'European Automotive',
                'sku' => 'MF77', 'group_size' => 'N77', 'battery_type' => 'SMF CAL',
                'cca' => 840, 'reserve_capacity' => 165, 'capacity_ah' => 90,
                'length_mm' => 315, 'width_mm' => 175, 'height_mm' => 175, 'total_height_mm' => 175,
                'terminal_type' => 'STD', 'terminal_layout' => 'C', 'hold_down' => 'EL & FL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 40, 'commercial_warranty_months' => null, 'unit_weight_kg' => 18,
            ],
            [
                'series' => 'GoldPlus',
                'application_segment' => 'European Automotive',
                'sku' => 'MF88H', 'group_size' => 'N88H', 'battery_type' => 'SMF CAL',
                'cca' => 950, 'reserve_capacity' => 210, 'capacity_ah' => 110,
                'length_mm' => 351, 'width_mm' => 175, 'height_mm' => 190, 'total_height_mm' => 190,
                'terminal_type' => 'STD', 'terminal_layout' => 'C', 'hold_down' => 'EL & FL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 40, 'commercial_warranty_months' => null, 'unit_weight_kg' => 18,
            ],

            // SilverPlus
            [
                'series' => 'SilverPlus',
                'application_segment' => '4WD, SUV, Truck & Industrial Applications',
                'sku' => 'SMFNS70X', 'group_size' => 'NS70', 'battery_type' => 'SMF CAL',
                'cca' => 700, 'reserve_capacity' => 125, 'capacity_ah' => 75,
                'length_mm' => 259, 'width_mm' => 173, 'height_mm' => 202, 'total_height_mm' => 223,
                'terminal_type' => 'STD', 'terminal_layout' => 'D', 'hold_down' => 'FL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 36, 'commercial_warranty_months' => null, 'unit_weight_kg' => 18,
            ],
            [
                'series' => 'SilverPlus',
                'application_segment' => '4WD, SUV, Truck & Industrial Applications',
                'sku' => 'SMFNS70LX', 'group_size' => 'NS70', 'battery_type' => 'SMF CAL',
                'cca' => 700, 'reserve_capacity' => 125, 'capacity_ah' => 75,
                'length_mm' => 259, 'width_mm' => 173, 'height_mm' => 202, 'total_height_mm' => 223,
                'terminal_type' => 'STD', 'terminal_layout' => 'C', 'hold_down' => 'FL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 36, 'commercial_warranty_months' => null, 'unit_weight_kg' => 18,
            ],
            [
                'series' => 'SilverPlus',
                'application_segment' => '4WD, SUV, Truck & Industrial Applications',
                'sku' => 'SMFN70ZZX', 'group_size' => 'N70', 'battery_type' => 'SMF CAL',
                'cca' => 765, 'reserve_capacity' => 165, 'capacity_ah' => 85,
                'length_mm' => 304, 'width_mm' => 173, 'height_mm' => 203, 'total_height_mm' => 224,
                'terminal_type' => 'STD', 'terminal_layout' => 'D', 'hold_down' => 'FL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 36, 'commercial_warranty_months' => null, 'unit_weight_kg' => 18,
            ],
            [
                'series' => 'SilverPlus',
                'application_segment' => '4WD, SUV, Truck & Industrial Applications',
                'sku' => 'SMFN70ZZLX', 'group_size' => 'N70', 'battery_type' => 'SMF CAL',
                'cca' => 765, 'reserve_capacity' => 165, 'capacity_ah' => 85,
                'length_mm' => 304, 'width_mm' => 173, 'height_mm' => 203, 'total_height_mm' => 224,
                'terminal_type' => 'STD', 'terminal_layout' => 'C', 'hold_down' => 'FL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 36, 'commercial_warranty_months' => null, 'unit_weight_kg' => 18,
            ],
            [
                'series' => 'SilverPlus',
                'application_segment' => 'European Automotive',
                'sku' => 'SMF44', 'group_size' => 'N44', 'battery_type' => 'SMF CAL',
                'cca' => 480, 'reserve_capacity' => 68, 'capacity_ah' => 45,
                'length_mm' => 208, 'width_mm' => 175, 'height_mm' => 175, 'total_height_mm' => 175,
                'terminal_type' => 'STD', 'terminal_layout' => 'C', 'hold_down' => 'EL & FL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 36, 'commercial_warranty_months' => 40, 'unit_weight_kg' => 18,
            ],
            [
                'series' => 'SilverPlus',
                'application_segment' => 'European Automotive',
                'sku' => 'SMF66H', 'group_size' => 'N66H', 'battery_type' => 'SMF CAL',
                'cca' => 780, 'reserve_capacity' => 160, 'capacity_ah' => 85,
                'length_mm' => 277, 'width_mm' => 175, 'height_mm' => 190, 'total_height_mm' => 190,
                'terminal_type' => 'STD', 'terminal_layout' => 'C', 'hold_down' => 'EL & FL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 36, 'commercial_warranty_months' => 40, 'unit_weight_kg' => 18,
            ],
            [
                'series' => 'SilverPlus',
                'application_segment' => 'Japanese Automotive',
                'sku' => 'SMFNS40ZLX', 'group_size' => 'NS40', 'battery_type' => 'SMF CAL',
                'cca' => 350, 'reserve_capacity' => 62, 'capacity_ah' => 40,
                'length_mm' => 196, 'width_mm' => 128, 'height_mm' => 199, 'total_height_mm' => 219,
                'terminal_type' => 'PT', 'terminal_layout' => 'C', 'hold_down' => 'NL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 36, 'commercial_warranty_months' => 40, 'unit_weight_kg' => 18,
            ],
            [
                'series' => 'SilverPlus',
                'application_segment' => 'Popular Automotive',
                'sku' => 'SMF43', 'group_size' => 'N43', 'battery_type' => 'SMF CAL',
                'cca' => 320, 'reserve_capacity' => 43, 'capacity_ah' => 35,
                'length_mm' => 238, 'width_mm' => 138, 'height_mm' => 186, 'total_height_mm' => 212,
                'terminal_type' => 'DFP', 'terminal_layout' => 'H', 'hold_down' => 'EL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 36, 'commercial_warranty_months' => 40, 'unit_weight_kg' => 18,
            ],

            // Classic
            [
                'series' => 'Classic',
                'application_segment' => '4WD & Truck',
                'sku' => 'NS70', 'group_size' => 'NS70', 'battery_type' => 'SMF CAL',
                'cca' => 615, 'reserve_capacity' => 95, 'capacity_ah' => 70,
                'length_mm' => 259, 'width_mm' => 173, 'height_mm' => 202, 'total_height_mm' => 223,
                'terminal_type' => 'STD', 'terminal_layout' => 'D', 'hold_down' => 'FL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 30, 'commercial_warranty_months' => null, 'unit_weight_kg' => 12,
            ],
            [
                'series' => 'Classic',
                'application_segment' => '4WD & Truck',
                'sku' => 'N70ZZLX', 'group_size' => 'N70', 'battery_type' => 'SMF CAL',
                'cca' => 680, 'reserve_capacity' => 130, 'capacity_ah' => 75,
                'length_mm' => 304, 'width_mm' => 173, 'height_mm' => 203, 'total_height_mm' => 224,
                'terminal_type' => 'STD', 'terminal_layout' => 'C', 'hold_down' => 'FL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 30, 'commercial_warranty_months' => null, 'unit_weight_kg' => 12,
            ],
            [
                'series' => 'Classic',
                'application_segment' => 'European Automotive',
                'sku' => 'N55', 'group_size' => 'N55', 'battery_type' => 'SMF CAL',
                'cca' => 500, 'reserve_capacity' => 90, 'capacity_ah' => 54,
                'length_mm' => 242, 'width_mm' => 175, 'height_mm' => 175, 'total_height_mm' => 175,
                'terminal_type' => 'STD', 'terminal_layout' => 'C', 'hold_down' => 'EL & FL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 30, 'commercial_warranty_months' => null, 'unit_weight_kg' => 12,
            ],
            [
                'series' => 'Classic',
                'application_segment' => 'Japanese Automotive',
                'sku' => 'NS40ZL', 'group_size' => 'NS40', 'battery_type' => 'SMF CAL',
                'cca' => 340, 'reserve_capacity' => 55, 'capacity_ah' => 38,
                'length_mm' => 196, 'width_mm' => 128, 'height_mm' => 199, 'total_height_mm' => 219,
                'terminal_type' => 'PT', 'terminal_layout' => 'C', 'hold_down' => 'NL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 30, 'commercial_warranty_months' => null, 'unit_weight_kg' => 12,
            ],
            [
                'series' => 'Classic',
                'application_segment' => 'Popular Automotive',
                'sku' => 'NS50P', 'group_size' => 'A46', 'battery_type' => 'SMF CAL',
                'cca' => 480, 'reserve_capacity' => 75, 'capacity_ah' => 40,
                'length_mm' => 237, 'width_mm' => 171, 'height_mm' => 182, 'total_height_mm' => 203,
                'terminal_type' => 'STD', 'terminal_layout' => 'D', 'hold_down' => 'EL & FL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 30, 'commercial_warranty_months' => null, 'unit_weight_kg' => 12,
            ],

            // Gladiator
            [
                'series' => 'Gladiator',
                'application_segment' => 'Gladiator 5 Years',
                'sku' => 'MFULD23L', 'group_size' => 'D23', 'battery_type' => 'SMF CAL',
                'cca' => 650, 'reserve_capacity' => 120, 'capacity_ah' => 75,
                'length_mm' => 233, 'width_mm' => 173, 'height_mm' => 201, 'total_height_mm' => 222,
                'terminal_type' => 'STD', 'terminal_layout' => 'C', 'hold_down' => 'FL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 50, 'commercial_warranty_months' => 60, 'unit_weight_kg' => 24,
            ],
            [
                'series' => 'Gladiator',
                'application_segment' => 'Gladiator 5 Years',
                'sku' => 'MFULD23R', 'group_size' => 'D23', 'battery_type' => 'SMF CAL',
                'cca' => 650, 'reserve_capacity' => 120, 'capacity_ah' => 75,
                'length_mm' => 233, 'width_mm' => 173, 'height_mm' => 201, 'total_height_mm' => 222,
                'terminal_type' => 'STD', 'terminal_layout' => 'D', 'hold_down' => 'FL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 50, 'commercial_warranty_months' => 60, 'unit_weight_kg' => 24,
            ],
            [
                'series' => 'Gladiator',
                'application_segment' => 'Gladiator 5 Years',
                'sku' => 'MFULD26L', 'group_size' => 'NS70', 'battery_type' => 'SMF CAL',
                'cca' => 750, 'reserve_capacity' => 150, 'capacity_ah' => 85,
                'length_mm' => 259, 'width_mm' => 173, 'height_mm' => 202, 'total_height_mm' => 222,
                'terminal_type' => 'STD', 'terminal_layout' => 'C', 'hold_down' => 'FL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 50, 'commercial_warranty_months' => 60, 'unit_weight_kg' => 24,
            ],
            [
                'series' => 'Gladiator',
                'application_segment' => 'Gladiator 5 Years',
                'sku' => 'MFULD31R', 'group_size' => 'N70', 'battery_type' => 'SMF CAL',
                'cca' => 850, 'reserve_capacity' => 180, 'capacity_ah' => 95,
                'length_mm' => 304, 'width_mm' => 173, 'height_mm' => 203, 'total_height_mm' => 223,
                'terminal_type' => 'STD', 'terminal_layout' => 'D', 'hold_down' => 'FL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 50, 'commercial_warranty_months' => 60, 'unit_weight_kg' => 24,
            ],

            // Stop-Start AGM
            [
                'series' => 'Stop-Start',
                'application_segment' => 'Absorbed Glass Mat - AGM',
                'sku' => 'MF44HSS', 'group_size' => 'N44H', 'battery_type' => 'AGM SS',
                'cca' => 540, 'reserve_capacity' => 80, 'capacity_ah' => 50,
                'length_mm' => 208, 'width_mm' => 175, 'height_mm' => 190, 'total_height_mm' => 190,
                'terminal_type' => 'STD', 'terminal_layout' => 'C', 'hold_down' => 'EL & FL', 'vent_type' => 'TS',
                'maintenance_free' => false, 'private_warranty_months' => 36, 'commercial_warranty_months' => null, 'unit_weight_kg' => 12,
            ],
            [
                'series' => 'Stop-Start',
                'application_segment' => 'Absorbed Glass Mat - AGM',
                'sku' => 'MF55HSS', 'group_size' => 'N55H', 'battery_type' => 'AGM SS',
                'cca' => 680, 'reserve_capacity' => 100, 'capacity_ah' => 60,
                'length_mm' => 242, 'width_mm' => 175, 'height_mm' => 190, 'total_height_mm' => 190,
                'terminal_type' => 'STD', 'terminal_layout' => 'C', 'hold_down' => 'EL & FL', 'vent_type' => 'TS',
                'maintenance_free' => false, 'private_warranty_months' => 36, 'commercial_warranty_months' => null, 'unit_weight_kg' => 12,
            ],
            [
                'series' => 'Stop-Start',
                'application_segment' => 'Absorbed Glass Mat - AGM',
                'sku' => 'MF77HSS', 'group_size' => 'N77H', 'battery_type' => 'AGM SS',
                'cca' => 800, 'reserve_capacity' => 140, 'capacity_ah' => 80,
                'length_mm' => 315, 'width_mm' => 175, 'height_mm' => 190, 'total_height_mm' => 190,
                'terminal_type' => 'STD', 'terminal_layout' => 'C', 'hold_down' => 'EL & FL', 'vent_type' => 'TS',
                'maintenance_free' => false, 'private_warranty_months' => 36, 'commercial_warranty_months' => null, 'unit_weight_kg' => 12,
            ],
            [
                'series' => 'Stop-Start',
                'application_segment' => 'Absorbed Glass Mat - AGM',
                'sku' => 'MF77HSSR', 'group_size' => 'N77H', 'battery_type' => 'AGM SS',
                'cca' => 800, 'reserve_capacity' => 140, 'capacity_ah' => 80,
                'length_mm' => 315, 'width_mm' => 175, 'height_mm' => 190, 'total_height_mm' => 190,
                'terminal_type' => 'STD', 'terminal_layout' => 'D', 'hold_down' => 'EL & FL', 'vent_type' => 'TS',
                'maintenance_free' => false, 'private_warranty_months' => 36, 'commercial_warranty_months' => null, 'unit_weight_kg' => 12,
            ],
            [
                'series' => 'Stop-Start',
                'application_segment' => 'Absorbed Glass Mat - AGM',
                'sku' => 'MF95HSS', 'group_size' => 'DIN100', 'battery_type' => 'AGM SS',
                'cca' => 950, 'reserve_capacity' => 205, 'capacity_ah' => 105,
                'length_mm' => 393, 'width_mm' => 174, 'height_mm' => 190, 'total_height_mm' => 190,
                'terminal_type' => 'STD', 'terminal_layout' => 'C', 'hold_down' => 'EL & FL', 'vent_type' => 'TS',
                'maintenance_free' => false, 'private_warranty_months' => 36, 'commercial_warranty_months' => null, 'unit_weight_kg' => 12,
            ],

            // Stop-Start EFB
            [
                'series' => 'Stop-Start',
                'application_segment' => 'Enhanced Flooded Batteries - EFB',
                'sku' => 'MFB24EF', 'group_size' => 'NS60', 'battery_type' => 'EFB SS',
                'cca' => 475, 'reserve_capacity' => 90, 'capacity_ah' => 55,
                'length_mm' => 238, 'width_mm' => 129, 'height_mm' => 205, 'total_height_mm' => 225,
                'terminal_type' => 'PT', 'terminal_layout' => 'C', 'hold_down' => 'NL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 36, 'commercial_warranty_months' => null, 'unit_weight_kg' => 12,
            ],
            [
                'series' => 'Stop-Start',
                'application_segment' => 'Enhanced Flooded Batteries - EFB',
                'sku' => 'MFD23EF', 'group_size' => 'D23', 'battery_type' => 'EFB SS',
                'cca' => 685, 'reserve_capacity' => 112, 'capacity_ah' => 67,
                'length_mm' => 231, 'width_mm' => 172, 'height_mm' => 200, 'total_height_mm' => 220,
                'terminal_type' => 'STD', 'terminal_layout' => 'C', 'hold_down' => 'FL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 36, 'commercial_warranty_months' => null, 'unit_weight_kg' => 12,
            ],
            [
                'series' => 'Stop-Start',
                'application_segment' => 'Enhanced Flooded Batteries - EFB',
                'sku' => 'MFD23EFR', 'group_size' => 'D23', 'battery_type' => 'EFB SS',
                'cca' => 685, 'reserve_capacity' => 112, 'capacity_ah' => 67,
                'length_mm' => 231, 'width_mm' => 172, 'height_mm' => 200, 'total_height_mm' => 220,
                'terminal_type' => 'STD', 'terminal_layout' => 'D', 'hold_down' => 'FL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 36, 'commercial_warranty_months' => null, 'unit_weight_kg' => 12,
            ],
            [
                'series' => 'Stop-Start',
                'application_segment' => 'Enhanced Flooded Batteries - EFB',
                'sku' => 'MFD26EF', 'group_size' => 'NS70', 'battery_type' => 'EFB SS',
                'cca' => 700, 'reserve_capacity' => 130, 'capacity_ah' => 75,
                'length_mm' => 258, 'width_mm' => 172, 'height_mm' => 200, 'total_height_mm' => 220,
                'terminal_type' => 'STD', 'terminal_layout' => 'C', 'hold_down' => 'NL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 24, 'commercial_warranty_months' => null, 'unit_weight_kg' => 12,
            ],
            [
                'series' => 'Stop-Start',
                'application_segment' => 'Enhanced Flooded Batteries - EFB',
                'sku' => 'MFD31EF', 'group_size' => 'N70', 'battery_type' => 'EFB SS',
                'cca' => 830, 'reserve_capacity' => 155, 'capacity_ah' => 95,
                'length_mm' => 303, 'width_mm' => 172, 'height_mm' => 200, 'total_height_mm' => 220,
                'terminal_type' => 'STD', 'terminal_layout' => 'C', 'hold_down' => 'NL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 24, 'commercial_warranty_months' => null, 'unit_weight_kg' => 12,
            ],
            [
                'series' => 'Stop-Start',
                'application_segment' => 'Enhanced Flooded Batteries - EFB',
                'sku' => 'MF66HEF', 'group_size' => 'N66H', 'battery_type' => 'EFB SS',
                'cca' => 750, 'reserve_capacity' => 120, 'capacity_ah' => 70,
                'length_mm' => 278, 'width_mm' => 175, 'height_mm' => 190, 'total_height_mm' => 190,
                'terminal_type' => 'STD', 'terminal_layout' => 'C', 'hold_down' => 'EL & FL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 24, 'commercial_warranty_months' => null, 'unit_weight_kg' => 12,
            ],
            [
                'series' => 'Stop-Start',
                'application_segment' => 'Enhanced Flooded Batteries - EFB',
                'sku' => 'MF77HEF', 'group_size' => 'N77H', 'battery_type' => 'EFB SS',
                'cca' => 800, 'reserve_capacity' => 150, 'capacity_ah' => 80,
                'length_mm' => 315, 'width_mm' => 174, 'height_mm' => 190, 'total_height_mm' => 190,
                'terminal_type' => 'STD', 'terminal_layout' => 'C', 'hold_down' => 'EL & FL', 'vent_type' => 'TS',
                'maintenance_free' => true, 'private_warranty_months' => 24, 'commercial_warranty_months' => null, 'unit_weight_kg' => 12,
            ],
        ];

        foreach ($catalog as $row) {
            BatteryModel::create($this->baseRecord($row));
        }
    }
}