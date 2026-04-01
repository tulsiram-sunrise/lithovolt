<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Phase 2: Migrate legacy data to unified catalog schema
     * 
     * Migration Strategy:
     * 1. BatteryModel → CatalogItem (type='BATTERY')
     * 2. Accessory → CatalogItem (type='ACCESSORY')  
     * 3. Product → CatalogItem (type='PRODUCT' or by detected type)
     * 4. Update SerialNumbers, Warranties, OrderItems with new FK references
     * 
     * IMPORTANT: This migration is designed to be idempotent and safe
     * - Preserves all legacy_*_id columns for audit trail
     * - Does not delete legacy tables
     * - Validates data integrity
     */
    public function up(): void
    {
        // Only run if target tables exist and are empty
        if (!Schema::hasTable('catalog_items') || DB::table('catalog_items')->count() > 0) {
            return;
        }

        DB::transaction(function () {
            // ============ PHASE 2A: BatteryModel → CatalogItem ============
            $this->migrateBatteryModels();

            // ============ PHASE 2B: Accessory → CatalogItem ============
            $this->migrateAccessories();

            // ============ PHASE 2C: Product → CatalogItem ============
            // (If using the temporary Product table during development)
            $this->migrateProducts();

            // ============ PHASE 2D: Update dependent FK references ============
            $this->updateSerialNumberReferences();
            $this->updateWarrantyReferences();
            $this->updateOrderItemReferences();

            // ============ PHASE 2E: Verify data integrity ============
            $this->verifyMigrationIntegrity();
        });
    }

    /**
     * Migrate BatteryModel records to CatalogItem
     */
    private function migrateBatteryModels(): void
    {
        $batteryModels = DB::table('battery_models')
            ->whereNull('deleted_at')
            ->get();

        foreach ($batteryModels as $bm) {
            $catalogItemId = DB::table('catalog_items')->insertGetId([
                // Core identity
                'type' => 'BATTERY',
                'sku' => $bm->sku,
                'name' => $bm->name,
                'slug' => Str::slug($bm->name),

                // Commercial
                'description' => $bm->description,
                'price' => $bm->price ?? 0,

                // Inventory
                'total_quantity' => $bm->total_quantity ?? 0,
                'available_quantity' => $bm->available_quantity ?? 0,
                'reserved_quantity' => 0,
                'low_stock_threshold' => 5,

                // Capabilities (batteries are always serialized + warranty eligible)
                'is_active' => $bm->status === 'active' ? 1 : 0,
                'is_serialized' => 1,
                'is_warranty_eligible' => 1,
                'is_fitment_eligible' => 0,
                'is_returnable' => 1,
                'allows_backorder' => 0,

                // Warranty
                'default_warranty_months' => $bm->warranty_months ?? 24,
                'private_warranty_months' => $bm->private_warranty_months,
                'commercial_warranty_months' => $bm->commercial_warranty_months,
                'warranty_coverage_type' => 'MANUFACTURING',

                // Battery-specific electrical specs
                'voltage_nominal' => $bm->voltage,
                'capacity_ah' => $bm->capacity_ah ?? $bm->capacity,
                'chemistry' => $bm->chemistry,
                'battery_type' => $bm->battery_type,
                'cca' => $bm->cca,
                'reserve_capacity' => $bm->reserve_capacity,

                // Physical dimensions
                'length_mm' => $bm->length_mm,
                'width_mm' => $bm->width_mm,
                'height_mm' => $bm->height_mm,
                'total_height_mm' => $bm->total_height_mm,
                'unit_weight_kg' => $bm->unit_weight_kg,

                // Terminal & mounting
                'terminal_type' => $bm->terminal_type,
                'terminal_layout' => $bm->terminal_layout,
                'hold_down' => $bm->hold_down,
                'vent_type' => $bm->vent_type,
                'group_size' => $bm->group_size,

                // Battery maintenance & performance
                'maintenance_free' => $bm->maintenance_free ? 1 : 0,
                'cycle_life' => null, // Not in legacy model
                'bms_included' => 0, // Default false, could be inferred from specs

                // Brand & model info
                'brand' => $bm->brand,
                'series' => $bm->series,
                'model_code' => $bm->model_code,

                // Documentation
                'datasheet_url' => $bm->datasheet_url,
                'application_segment' => $bm->application_segment,

                // Legacy bridge
                'legacy_battery_model_id' => $bm->id,

                // Timestamps
                'created_at' => $bm->created_at,
                'updated_at' => $bm->updated_at,
                'published_at' => !empty($bm->status) && $bm->status === 'active' ? $bm->created_at : null,
            ]);

            // Log: Battery migrated
            DB::table('catalog_item_audit_logs')->insert([
                'catalog_item_id' => $catalogItemId,
                'action' => 'CREATE',
                'changed_field' => 'legacy_battery_model_id',
                'new_value' => json_encode($bm->id),
                'created_at' => now(),
            ]);
        }

        echo "Migrated " . $batteryModels->count() . " battery models.\n";
    }

    /**
     * Migrate Accessory records to CatalogItem
     */
    private function migrateAccessories(): void
    {
        // Only if accessories table exists
        if (!Schema::hasTable('accessories')) {
            return;
        }

        $accessories = DB::table('accessories')
            ->whereNull('deleted_at')
            ->get();

        foreach ($accessories as $acc) {
            $catalogItemId = DB::table('catalog_items')->insertGetId([
                'type' => 'ACCESSORY',
                'sku' => $acc->sku,
                'name' => $acc->name,
                'slug' => Str::slug($acc->name),
                'description' => $acc->description,
                'price' => $acc->price ?? 0,
                'total_quantity' => $acc->total_quantity ?? 0,
                'available_quantity' => $acc->available_quantity ?? 0,
                'reserved_quantity' => 0,
                'is_active' => $acc->status === 'active' ? 1 : 0,
                'is_serialized' => 0,
                'is_warranty_eligible' => 0,
                'is_fitment_eligible' => 1,
                'is_returnable' => 1,
                'allows_backorder' => 0,
                'legacy_accessory_id' => $acc->id,
                'created_at' => $acc->created_at,
                'updated_at' => $acc->updated_at,
                'published_at' => $acc->status === 'active' ? $acc->created_at : null,
            ]);

            DB::table('catalog_item_audit_logs')->insert([
                'catalog_item_id' => $catalogItemId,
                'action' => 'CREATE',
                'changed_field' => 'legacy_accessory_id',
                'new_value' => json_encode($acc->id),
                'created_at' => now(),
            ]);
        }

        echo "Migrated " . $accessories->count() . " accessories.\n";
    }

    /**
     * Migrate Product records to CatalogItem
     * (If using the temporary Product table during development)
     */
    private function migrateProducts(): void
    {
        // Skip if products table doesn't exist
        if (!Schema::hasTable('products')) {
            return;
        }

        $products = DB::table('products')
            ->whereNull('deleted_at')
            ->get();

        foreach ($products as $prod) {
            $metadata = [];
            if (is_array($prod->metadata ?? null)) {
                $metadata = $prod->metadata;
            } elseif (is_string($prod->metadata ?? null) && $prod->metadata !== '') {
                $decoded = json_decode($prod->metadata, true);
                $metadata = is_array($decoded) ? $decoded : [];
            }

            // Determine type from product_type or infer
            $type = !empty($prod->product_type) 
                ? strtoupper($prod->product_type) 
                : 'GENERIC';

            // Check if this product is already mapped to a catalog item via legacy_*_id
            $existingMapping = DB::table('catalog_items')
                ->where('legacy_product_id', $prod->id)
                ->first();

            if ($existingMapping) {
                continue; // Already migrated
            }

            // Also check if product references a battery_model we already migrated
            if (!empty($prod->legacy_battery_model_id)) {
                $existing = DB::table('catalog_items')
                    ->where('legacy_battery_model_id', $prod->legacy_battery_model_id)
                    ->first();
                if ($existing) {
                    // Update existing to also link to product
                    DB::table('catalog_items')
                        ->where('id', $existing->id)
                        ->update(['legacy_product_id' => $prod->id]);
                    continue;
                }
            }

            // Create new CatalogItem from Product
            $catalogItemId = DB::table('catalog_items')->insertGetId([
                'type' => $type,
                'sku' => $prod->sku,
                'name' => $prod->name,
                'slug' => Str::slug($prod->name),
                'description' => $prod->description,
                'image_url' => $prod->image_url,
                'price' => $prod->price ?? 0,
                'total_quantity' => $prod->total_quantity ?? 0,
                'available_quantity' => $prod->available_quantity ?? 0,
                'reserved_quantity' => 0,
                'is_active' => $prod->is_active ? 1 : 0,
                'is_serialized' => $prod->is_serialized ? 1 : 0,
                'is_warranty_eligible' => $prod->is_warranty_eligible ? 1 : 0,
                'is_fitment_eligible' => $prod->is_fitment_eligible ? 1 : 0,
                'is_returnable' => 1,
                'allows_backorder' => 0,
                'default_warranty_months' => $prod->default_warranty_months,
                
                // Extract battery specs from metadata if present
                'voltage_nominal' => $metadata['voltage_nominal'] ?? null,
                'capacity_ah' => $metadata['capacity_ah'] ?? null,
                'capacity_wh' => $metadata['capacity_wh'] ?? null,
                'chemistry' => $metadata['chemistry'] ?? null,
                'battery_type' => $metadata['battery_type'] ?? null,
                'brand' => $metadata['brand'] ?? null,
                'series' => $metadata['series'] ?? null,
                
                'legacy_product_id' => $prod->id,
                'legacy_battery_model_id' => $prod->legacy_battery_model_id,
                'legacy_accessory_id' => $prod->legacy_accessory_id,
                'metadata' => !empty($metadata) ? json_encode($metadata) : null,
                'created_at' => $prod->created_at,
                'updated_at' => $prod->updated_at,
                'published_at' => $prod->is_active ? now() : null,
            ]);

            DB::table('catalog_item_audit_logs')->insert([
                'catalog_item_id' => $catalogItemId,
                'action' => 'CREATE',
                'changed_field' => 'legacy_product_id',
                'new_value' => json_encode($prod->id),
                'created_at' => now(),
            ]);
        }

        echo "Migrated " . $products->count() . " products.\n";
    }

    /**
     * Update SerialNumber FK references to new CatalogItem table
     */
    private function updateSerialNumberReferences(): void
    {
        if (!Schema::hasTable('serial_numbers')) {
            return;
        }

        // For each serial number with a battery_model_id, find the corresponding catalog_item
        $serialNumbers = DB::table('serial_numbers')
            ->whereNotNull('battery_model_id')
            ->get();

        foreach ($serialNumbers as $sn) {
            $catalogItem = DB::table('catalog_items')
                ->where('legacy_battery_model_id', $sn->battery_model_id)
                ->first();

            if ($catalogItem) {
                DB::table('serial_numbers')
                    ->where('id', $sn->id)
                    ->update(['catalog_item_id' => $catalogItem->id]);
            }
        }

        echo "Updated " . $serialNumbers->count() . " serial number references.\n";
    }

    /**
     * Update Warranty FK references
     */
    private function updateWarrantyReferences(): void
    {
        if (!Schema::hasTable('warranties')) {
            return;
        }

        $warranties = DB::table('warranties')
            ->whereNotNull('battery_model_id')
            ->get();

        foreach ($warranties as $warranty) {
            $catalogItem = DB::table('catalog_items')
                ->where('legacy_battery_model_id', $warranty->battery_model_id)
                ->first();

            if ($catalogItem) {
                DB::table('warranties')
                    ->where('id', $warranty->id)
                    ->update(['catalog_item_id' => $catalogItem->id]);
            }
        }

        echo "Updated " . $warranties->count() . " warranty references.\n";
    }

    /**
     * Update OrderItem FK references  
     */
    private function updateOrderItemReferences(): void
    {
        if (!Schema::hasTable('order_items')) {
            return;
        }

        // Update order items that reference BatteryModel via polymorphic type
        $orderItems = DB::table('order_items')
            ->where('itemable_type', 'BatteryModel')
            ->orWhere('itemable_type', 'Accessory')
            ->get();

        foreach ($orderItems as $item) {
            $catalogItem = null;

            if ($item->itemable_type === 'BatteryModel') {
                $catalogItem = DB::table('catalog_items')
                    ->where('legacy_battery_model_id', $item->itemable_id)
                    ->first();
            } elseif ($item->itemable_type === 'Accessory') {
                $catalogItem = DB::table('catalog_items')
                    ->where('legacy_accessory_id', $item->itemable_id)
                    ->first();
            }

            if ($catalogItem) {
                DB::table('order_items')
                    ->where('id', $item->id)
                    ->update(['catalog_item_id' => $catalogItem->id]);
            }
        }

        echo "Updated " . $orderItems->count() . " order item references.\n";
    }

    /**
     * Verify that migration was successful
     */
    private function verifyMigrationIntegrity(): void
    {
        $totalCatalogItems = DB::table('catalog_items')->count();
        $totalBatteries = DB::table('catalog_items')->where('type', 'BATTERY')->count();
        $totalAccessories = DB::table('catalog_items')->where('type', 'ACCESSORY')->count();

        $unmappedSerialNumbers = DB::table('serial_numbers')
            ->whereNotNull('battery_model_id')
            ->whereNull('catalog_item_id')
            ->count();

        $unmappedWarranties = DB::table('warranties')
            ->whereNotNull('battery_model_id')
            ->whereNull('catalog_item_id')
            ->count();

        echo "\n=== Migration Integrity Check ===\n";
        echo "Total Catalog Items: {$totalCatalogItems}\n";
        echo "  - Batteries: {$totalBatteries}\n";
        echo "  - Accessories: {$totalAccessories}\n";
        echo "Unmapped Serial Numbers: {$unmappedSerialNumbers}\n";
        echo "Unmapped Warranties: {$unmappedWarranties}\n";

        if ($unmappedSerialNumbers > 0 || $unmappedWarranties > 0) {
            throw new \Exception(
                "Migration failed: Found {$unmappedSerialNumbers} unmapped serial numbers "
                . "and {$unmappedWarranties} unmapped warranties"
            );
        }

        echo "✓ Migration integrity verified!\n";
    }

    public function down(): void
    {
        // Don't delete catalog_items on rollback - that's permanent data
        // Instead, preserve the migration as read-only
        echo "Data migration cannot be rolled back. If needed, restore from backup.\n";
    }
};
