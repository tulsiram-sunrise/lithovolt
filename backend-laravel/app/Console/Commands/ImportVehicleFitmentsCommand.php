<?php

namespace App\Console\Commands;

use App\Models\BatteryModel;
use App\Models\VehicleFitment;
use App\Models\VehicleFitmentRecommendation;
use Illuminate\Console\Command;

class ImportVehicleFitmentsCommand extends Command
{
    protected $signature = 'fitment:import-csv {path : CSV file path} {--market=AU : Default market code}';

    protected $description = 'Import vehicle fitments and battery recommendations from CSV';

    public function handle(): int
    {
        $path = (string) $this->argument('path');
        if (!is_file($path)) {
            $this->error('CSV file not found: ' . $path);
            return self::FAILURE;
        }

        $handle = fopen($path, 'r');
        if ($handle === false) {
            $this->error('Unable to read CSV file.');
            return self::FAILURE;
        }

        $headers = fgetcsv($handle);
        if (!is_array($headers) || $headers === []) {
            fclose($handle);
            $this->error('CSV appears empty or invalid.');
            return self::FAILURE;
        }

        $headerMap = array_map(static fn ($h) => strtolower(trim((string) $h)), $headers);
        $created = 0;
        $updated = 0;
        $recsCreated = 0;

        while (($row = fgetcsv($handle)) !== false) {
            $data = [];
            foreach ($headerMap as $index => $header) {
                $data[$header] = $row[$index] ?? null;
            }

            $market = strtoupper((string) ($data['market'] ?: $this->option('market')));
            $make = strtoupper(trim((string) ($data['make'] ?? '')));
            $model = strtoupper(trim((string) ($data['model'] ?? '')));

            if ($make === '' || $model === '') {
                continue;
            }

            $fitment = VehicleFitment::firstOrCreate(
                [
                    'market' => $market,
                    'make' => $make,
                    'model' => $model,
                    'variant' => $data['variant'] ?: null,
                    'year_from' => $this->toIntOrNull($data['year_from'] ?? null),
                    'year_to' => $this->toIntOrNull($data['year_to'] ?? null),
                ],
                [
                    'state_code' => $this->toNullableString($data['state_code'] ?? null),
                    'fuel_type' => $this->toNullableString($data['fuel_type'] ?? null),
                    'body_type' => $this->toNullableString($data['body_type'] ?? null),
                    'drivetrain' => $this->toNullableString($data['drivetrain'] ?? null),
                    'is_active' => true,
                    'notes' => $this->toNullableString($data['notes'] ?? null),
                ]
            );

            if ($fitment->wasRecentlyCreated) {
                $created++;
            } else {
                $updated++;
            }

            $recsCreated += $this->attachRecommendation($fitment->id, (string) ($data['primary_sku'] ?? ''), 'PRIMARY', 1);
            $recsCreated += $this->attachRecommendation($fitment->id, (string) ($data['alternate_sku'] ?? ''), 'ALTERNATE', 2);
        }

        fclose($handle);

        $this->info("Fitments created: {$created}");
        $this->info("Fitments matched existing: {$updated}");
        $this->info("Recommendations created: {$recsCreated}");

        return self::SUCCESS;
    }

    private function attachRecommendation(int $fitmentId, string $sku, string $type, int $priority): int
    {
        $trimmedSku = trim($sku);
        if ($trimmedSku === '') {
            return 0;
        }

        $battery = BatteryModel::where('sku', $trimmedSku)->first();
        if (!$battery) {
            $this->warn("Battery SKU not found: {$trimmedSku}");
            return 0;
        }

        VehicleFitmentRecommendation::firstOrCreate(
            [
                'vehicle_fitment_id' => $fitmentId,
                'battery_model_id' => $battery->id,
                'recommendation_type' => $type,
            ],
            [
                'priority' => $priority,
            ]
        );

        return 1;
    }

    private function toIntOrNull(mixed $value): ?int
    {
        if ($value === null || trim((string) $value) === '') {
            return null;
        }

        return (int) $value;
    }

    private function toNullableString(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim((string) $value);
        return $trimmed === '' ? null : $trimmed;
    }
}
