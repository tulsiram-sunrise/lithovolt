<?php

namespace App\Console\Commands;

use App\Models\Accessory;
use App\Models\BatteryModel;
use App\Models\Product;
use App\Models\SerialNumber;
use App\Models\Warranty;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class BackfillUnifiedCatalogCommand extends Command
{
    protected $signature = 'catalog:backfill-unified {--dry-run : Preview changes without writing} {--force : Execute write operations}';

    protected $description = 'Backfill products table with legacy battery/accessory catalog mappings and link serial/warranty records.';

    public function handle(): int
    {
        $isDryRun = (bool) $this->option('dry-run');
        $isForce = (bool) $this->option('force');

        if (!$isDryRun && !$isForce) {
            $this->error('Use --dry-run to preview or --force to execute writes.');
            return self::FAILURE;
        }

        $summary = [
            'battery_products_created' => 0,
            'accessory_products_created' => 0,
            'serials_linked' => 0,
            'warranties_linked' => 0,
            'generic_products_updated' => 0,
        ];

        $runner = function () use (&$summary, $isDryRun): void {
            $summary['battery_products_created'] = $this->backfillBatteryProducts($isDryRun);
            $summary['accessory_products_created'] = $this->backfillAccessoryProducts($isDryRun);
            $summary['serials_linked'] = $this->linkSerialsToProducts($isDryRun);
            $summary['warranties_linked'] = $this->linkWarrantiesToProducts($isDryRun);
            $summary['generic_products_updated'] = $this->backfillGenericProducts($isDryRun);
        };

        if ($isDryRun) {
            $runner();
            $this->info('Dry-run completed. No changes were written.');
        } else {
            DB::transaction($runner);
            $this->info('Backfill completed successfully.');
        }

        $this->table(['Metric', 'Count'], [
            ['Battery products created', $summary['battery_products_created']],
            ['Accessory products created', $summary['accessory_products_created']],
            ['Serial numbers linked', $summary['serials_linked']],
            ['Warranties linked', $summary['warranties_linked']],
            ['Legacy generic products normalized', $summary['generic_products_updated']],
        ]);

        return self::SUCCESS;
    }

    private function backfillBatteryProducts(bool $isDryRun): int
    {
        $created = 0;
        $batteries = BatteryModel::withTrashed()->get();

        foreach ($batteries as $battery) {
            $existing = Product::where('legacy_battery_model_id', $battery->id)->first();
            if ($existing) {
                continue;
            }

            $payload = [
                'name' => $battery->name,
                'product_type' => 'BATTERY',
                'sku' => $this->makeUniqueSku($battery->sku, 'BAT', $battery->id),
                'legacy_battery_model_id' => $battery->id,
                'description' => $battery->description,
                'price' => $battery->price ?? 0,
                'total_quantity' => $battery->total_quantity ?? 0,
                'available_quantity' => $battery->available_quantity ?? 0,
                'low_stock_threshold' => 5,
                'metadata' => [
                    'source' => 'battery_models',
                    'source_id' => $battery->id,
                    'brand' => $battery->brand,
                    'series' => $battery->series,
                    'model_code' => $battery->model_code,
                    'group_size' => $battery->group_size,
                    'voltage' => $battery->voltage,
                    'capacity' => $battery->capacity,
                    'capacity_ah' => $battery->capacity_ah,
                    'chemistry' => $battery->chemistry,
                    'battery_type' => $battery->battery_type,
                    'cca' => $battery->cca,
                    'reserve_capacity' => $battery->reserve_capacity,
                    'specs' => $battery->specs,
                ],
                'is_active' => $battery->status === 'active',
                'is_serialized' => true,
                'is_warranty_eligible' => true,
                'is_fitment_eligible' => true,
                'default_warranty_months' => $battery->warranty_months,
            ];

            if (!$isDryRun) {
                Product::create($payload);
            }
            $created++;
        }

        return $created;
    }

    private function backfillAccessoryProducts(bool $isDryRun): int
    {
        $created = 0;
        $accessories = Accessory::withTrashed()->get();

        foreach ($accessories as $accessory) {
            $existing = Product::where('legacy_accessory_id', $accessory->id)->first();
            if ($existing) {
                continue;
            }

            $payload = [
                'name' => $accessory->name,
                'product_type' => 'ACCESSORY',
                'sku' => $this->makeUniqueSku($accessory->sku, 'ACC', $accessory->id),
                'legacy_accessory_id' => $accessory->id,
                'description' => $accessory->description,
                'price' => $accessory->price ?? 0,
                'total_quantity' => $accessory->total_quantity ?? 0,
                'available_quantity' => $accessory->available_quantity ?? 0,
                'low_stock_threshold' => 5,
                'metadata' => [
                    'source' => 'accessories',
                    'source_id' => $accessory->id,
                ],
                'is_active' => $accessory->status === 'active',
                'is_serialized' => false,
                'is_warranty_eligible' => false,
                'is_fitment_eligible' => false,
                'default_warranty_months' => null,
            ];

            if (!$isDryRun) {
                Product::create($payload);
            }
            $created++;
        }

        return $created;
    }

    private function linkSerialsToProducts(bool $isDryRun): int
    {
        $serials = SerialNumber::whereNull('product_id')
            ->whereNotNull('battery_model_id')
            ->get();

        $updated = 0;
        foreach ($serials as $serial) {
            $productId = Product::where('legacy_battery_model_id', $serial->battery_model_id)->value('id');
            if (!$productId) {
                continue;
            }

            if (!$isDryRun) {
                $serial->update(['product_id' => $productId]);
            }
            $updated++;
        }

        return $updated;
    }

    private function linkWarrantiesToProducts(bool $isDryRun): int
    {
        $warranties = Warranty::whereNull('product_id')
            ->whereNotNull('battery_model_id')
            ->get();

        $updated = 0;
        foreach ($warranties as $warranty) {
            $productId = Product::where('legacy_battery_model_id', $warranty->battery_model_id)->value('id');
            if (!$productId) {
                continue;
            }

            if (!$isDryRun) {
                $warranty->update(['product_id' => $productId]);
            }
            $updated++;
        }

        return $updated;
    }

    private function backfillGenericProducts(bool $isDryRun): int
    {
        $products = Product::whereNull('product_type')->orWhere('product_type', '')->get();
        $count = $products->count();

        if (!$isDryRun && $count > 0) {
            Product::whereNull('product_type')->orWhere('product_type', '')->update([
                'product_type' => 'GENERIC',
                'is_serialized' => false,
                'is_warranty_eligible' => false,
                'is_fitment_eligible' => false,
            ]);
        }

        return $count;
    }

    private function makeUniqueSku(?string $baseSku, string $prefix, int $sourceId): string
    {
        $seed = trim((string) $baseSku);
        if ($seed === '') {
            $seed = $prefix . '-' . $sourceId;
        }

        $candidate = $seed;
        $suffix = 1;
        while (Product::where('sku', $candidate)->exists()) {
            $candidate = $seed . '-' . strtolower($prefix) . '-' . $suffix;
            $suffix++;
        }

        return $candidate;
    }
}
