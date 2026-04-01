<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Phase 1: Create unified catalog schema alongside existing tables (no deletions)
     * This migration creates the foundation for consolidating BatteryModel, Product, and Accessory
     */
    public function up(): void
    {
        // 1. Main catalog items table with comprehensive column coverage
        Schema::create('catalog_items', function (Blueprint $table) {
            // Core Identity
            $table->id();
            $table->enum('type', ['BATTERY', 'ACCESSORY', 'PART', 'CONSUMABLE', 'SERVICE', 'GENERIC'])->default('GENERIC');
            $table->string('sku', 100)->unique();
            $table->string('name', 255);
            $table->string('slug', 255)->unique();
            
            // Categorization
            $table->string('category_path', 500)->nullable()->comment('Denormalized "Electronics > Batteries > Lithium"');
            
            // Commercial
            $table->longText('description')->nullable();
            $table->string('image_url', 500)->nullable();
            $table->decimal('price', 12, 2)->default(0);
            $table->decimal('cost_price', 12, 2)->nullable();
            $table->decimal('markup_percentage', 5, 2)->nullable();
            
            // Inventory
            $table->unsignedInteger('total_quantity')->default(0);
            $table->unsignedInteger('available_quantity')->default(0);
            $table->unsignedInteger('reserved_quantity')->default(0)->comment('Track pending orders');
            $table->unsignedInteger('low_stock_threshold')->default(5);
            $table->unsignedInteger('reorder_quantity')->default(10);
            
            // Capabilities
            $table->boolean('is_active')->default(true);
            $table->boolean('is_serialized')->default(false)->comment('Requires serial tracking');
            $table->boolean('is_warranty_eligible')->default(false);
            $table->boolean('is_fitment_eligible')->default(false)->comment('For electrical products');
            $table->boolean('is_returnable')->default(true);
            $table->boolean('allows_backorder')->default(false);
            
            // Warranty (unified from multiple sources)
            $table->unsignedInteger('default_warranty_months')->nullable();
            $table->unsignedInteger('private_warranty_months')->nullable()->comment('Consumer warranty');
            $table->unsignedInteger('commercial_warranty_months')->nullable()->comment('Bulk/commercial warranty');
            $table->enum('warranty_coverage_type', ['FULL', 'PARTIAL', 'MANUFACTURING'])->default('MANUFACTURING');
            
            // Type-Specific: BATTERY - Electrical Specs
            $table->double('voltage_nominal', 8, 2)->nullable()->comment('Nominal voltage');
            $table->double('capacity_ah', 10, 3)->nullable()->comment('Amp-hour capacity');
            $table->double('capacity_wh', 10, 3)->nullable()->comment('Watt-hour capacity');
            $table->string('chemistry', 120)->nullable()->comment('Lithium, AGM, Lead-Acid, etc.');
            $table->string('battery_type', 120)->nullable()->comment('LiFePO4, NMC, etc.');
            
            // Type-Specific: BATTERY - Power/Performance
            $table->double('max_charge_current_a', 8, 2)->nullable();
            $table->double('max_discharge_current_a', 8, 2)->nullable();
            $table->unsignedInteger('cca')->nullable()->comment('Cold Cranking Amps');
            $table->unsignedInteger('reserve_capacity')->nullable()->comment('Reserve capacity minutes');
            
            // Type-Specific: BATTERY - Physical
            $table->decimal('length_mm', 8, 2)->nullable();
            $table->decimal('width_mm', 8, 2)->nullable();
            $table->decimal('height_mm', 8, 2)->nullable();
            $table->decimal('total_height_mm', 8, 2)->nullable();
            $table->decimal('unit_weight_kg', 8, 3)->nullable();
            $table->string('terminal_type', 120)->nullable()->comment('Standard, Anderson, etc.');
            $table->string('terminal_layout', 120)->nullable();
            $table->string('hold_down', 120)->nullable();
            $table->string('vent_type', 120)->nullable();
            $table->string('group_size', 120)->nullable()->comment('For compatibility');
            
            // Type-Specific: BATTERY - Maintenance
            $table->boolean('maintenance_free')->default(false);
            $table->string('charge_voltage_range', 50)->nullable()->comment('e.g., 13.6V - 14.6V');
            $table->decimal('depth_of_discharge_percent', 5, 2)->nullable();
            $table->unsignedInteger('cycle_life')->nullable()->comment('3000, 5000, etc.');
            $table->boolean('bms_included')->default(false);
            
            // Type-Specific: ACCESSORY
            $table->json('compatible_types')->nullable()->comment('e.g., ["BATTERY", "INVERTER"]');
            
            // Type-Specific: SERVICE
            $table->unsignedInteger('duration_days')->nullable();
            $table->decimal('hourly_rate', 10, 2)->nullable();
            $table->unsignedInteger('max_concurrent_sessions')->nullable()->comment('Capacity limit');
            
            // Brand & Model
            $table->string('brand', 120)->nullable();
            $table->string('series', 120)->nullable();
            $table->string('model_code', 120)->nullable();
            $table->unsignedInteger('model_year')->nullable();
            
            // Documentation & Support
            $table->string('datasheet_url', 500)->nullable();
            $table->string('user_manual_url', 500)->nullable();
            $table->string('support_contact', 255)->nullable();
            $table->string('application_segment', 180)->nullable();
            
            // Audit & Lifecycle
            $table->timestamp('published_at')->nullable();
            $table->timestamp('discontinued_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Extensibility
            $table->json('metadata')->nullable()->comment('Flexible k-v store for edge cases');
            
            // Legacy Compatibility (temporary bridges for smooth migration)
            $table->unsignedBigInteger('legacy_battery_model_id')->nullable()->unique();
            $table->unsignedBigInteger('legacy_accessory_id')->nullable()->unique();
            $table->unsignedBigInteger('legacy_product_id')->nullable()->unique();
            
            // Indices for performance
            $table->index('type');
            $table->index(['type', 'is_active']);
            $table->index('sku');
            $table->index('category_path');
            $table->index('available_quantity');
            $table->index('deleted_at');
            
            // Full-text search index
            $table->fullText(['name', 'description', 'brand', 'model_code']);
        });

        // 2. Catalog categories table (enhanced from product_categories)
        Schema::create('catalog_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200)->unique();
            $table->string('slug', 200)->unique();
            $table->longText('description')->nullable();
            $table->unsignedBigInteger('parent_id')->nullable();
            
            // Denormalization for hierarchy
            $table->unsignedInteger('level')->default(0)->comment('0=root, 1=child');
            $table->string('path', 500)->nullable()->comment('Computed: "Electronics > Batteries > Lithium"');
            
            // Display & filtering
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('display_order')->default(0);
            $table->string('icon_url', 500)->nullable();
            $table->string('color_hex', 7)->nullable()->comment('For UI rendering');
            
            $table->timestamps();
            
            // Self-referencing foreign key
            $table->foreign('parent_id')
                ->references('id')
                ->on('catalog_categories')
                ->onDelete('set null');
            
            $table->index('parent_id');
            $table->index('is_active');
        });

        // 3. Many-to-many bridge between catalog items and categories
        Schema::create('catalog_item_categories', function (Blueprint $table) {
            $table->unsignedBigInteger('catalog_item_id');
            $table->unsignedBigInteger('catalog_category_id');
            $table->boolean('is_primary')->default(false)->comment('One category is primary');
            
            $table->primary(['catalog_item_id', 'catalog_category_id']);
            
            $table->foreign('catalog_item_id')
                ->references('id')
                ->on('catalog_items')
                ->onDelete('cascade');
            
            $table->foreign('catalog_category_id')
                ->references('id')
                ->on('catalog_categories')
                ->onDelete('cascade');
            
            $table->index('catalog_category_id');
        });

        // 4. Optional: Multi-variant support for products with variants
        Schema::create('catalog_variations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('catalog_item_id');
            $table->string('sku_suffix', 50)->nullable()->comment('e.g., "-100AH"');
            $table->string('name_suffix', 100)->nullable()->comment('e.g., "100Ah Variant"');
            
            // Variant-specific overrides (NULL = use parent)
            $table->decimal('price', 12, 2)->nullable();
            $table->string('image_url', 500)->nullable();
            
            // Variant-specific specs (subset for flexibility)
            $table->double('capacity_ah', 10, 3)->nullable();
            $table->double('capacity_wh', 10, 3)->nullable();
            
            // Variant inventory
            $table->unsignedInteger('total_quantity')->default(0);
            $table->unsignedInteger('available_quantity')->default(0);
            
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->foreign('catalog_item_id')
                ->references('id')
                ->on('catalog_items')
                ->onDelete('cascade');
            
            $table->unique(['catalog_item_id', 'sku_suffix']);
        });

        // 5. Audit log for inventory changes (optional but recommended)
        Schema::create('catalog_item_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('catalog_item_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->enum('action', ['CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'DISCONTINUE'])->default('UPDATE');
            
            $table->string('changed_field', 100)->nullable();
            $table->longText('old_value')->nullable();
            $table->longText('new_value')->nullable();
            
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            
            $table->timestamp('created_at')->useCurrent();
            
            $table->foreign('catalog_item_id')
                ->references('id')
                ->on('catalog_items')
                ->onDelete('cascade');
            
            $table->index('catalog_item_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('catalog_item_audit_logs');
        Schema::dropIfExists('catalog_variations');
        Schema::dropIfExists('catalog_item_categories');
        Schema::dropIfExists('catalog_categories');
        Schema::dropIfExists('catalog_items');
    }
};
