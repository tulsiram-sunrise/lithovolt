<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Phase 1b: Prepare dependent tables for unified catalog
     * Adds new FK columns without breaking existing relationships
     */
    public function up(): void
    {
        // 1. Update serial_numbers table to support catalog_items FK
        Schema::table('serial_numbers', function (Blueprint $table) {
            // Add new FK column (optional, allows gradual migration)
            if (!Schema::hasColumn('serial_numbers', 'catalog_item_id')) {
                $table->unsignedBigInteger('catalog_item_id')->nullable()->after('id');
                $table->foreign('catalog_item_id')
                    ->references('id')
                    ->on('catalog_items')
                    ->onDelete('cascade');
                $table->index('catalog_item_id');
            }
        });

        // 2. Update warranties table to support catalog_items FK
        Schema::table('warranties', function (Blueprint $table) {
            // Add new FK column (optional)
            if (!Schema::hasColumn('warranties', 'catalog_item_id')) {
                $table->unsignedBigInteger('catalog_item_id')->nullable()->after('id');
                $table->foreign('catalog_item_id')
                    ->references('id')
                    ->on('catalog_items')
                    ->onDelete('cascade');
                $table->index('catalog_item_id');
            }
        });

        // 3. Update order_items table for unified catalog
        Schema::table('order_items', function (Blueprint $table) {
            // Add new direct FK column (replaces polymorphic)
            if (!Schema::hasColumn('order_items', 'catalog_item_id')) {
                $table->unsignedBigInteger('catalog_item_id')->nullable()->after('id');
                $table->foreign('catalog_item_id')
                    ->references('id')
                    ->on('catalog_items')
                    ->onDelete('restrict');
                $table->index('catalog_item_id');
            }
            
            // Support for catalog_variations (optional multi-variant orders)
            if (!Schema::hasColumn('order_items', 'variation_id')) {
                $table->unsignedBigInteger('variation_id')->nullable();
                $table->foreign('variation_id')
                    ->references('id')
                    ->on('catalog_variations')
                    ->onDelete('set null');
            }
        });

        // 4. Create warehousing/locations table (optional, for future multi-location support)
        Schema::create('catalog_item_locations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('catalog_item_id');
            $table->string('location_code', 50)->comment('e.g., WAREHOUSE-A, SHOP-B');
            $table->unsignedInteger('quantity_available');
            $table->unsignedInteger('quantity_reserved');
            $table->timestamps();
            
            $table->unique(['catalog_item_id', 'location_code']);
            $table->foreign('catalog_item_id')
                ->references('id')
                ->on('catalog_items')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('catalog_item_locations');
        
        Schema::table('order_items', function (Blueprint $table) {
            if (Schema::hasColumn('order_items', 'variation_id')) {
                $table->dropForeign(['variation_id']);
                $table->dropColumn('variation_id');
            }
            if (Schema::hasColumn('order_items', 'catalog_item_id')) {
                $table->dropForeign(['catalog_item_id']);
                $table->dropIndex(['catalog_item_id']);
                $table->dropColumn('catalog_item_id');
            }
        });

        Schema::table('warranties', function (Blueprint $table) {
            if (Schema::hasColumn('warranties', 'catalog_item_id')) {
                $table->dropForeign(['catalog_item_id']);
                $table->dropIndex(['catalog_item_id']);
                $table->dropColumn('catalog_item_id');
            }
        });

        Schema::table('serial_numbers', function (Blueprint $table) {
            if (Schema::hasColumn('serial_numbers', 'catalog_item_id')) {
                $table->dropForeign(['catalog_item_id']);
                $table->dropIndex(['catalog_item_id']);
                $table->dropColumn('catalog_item_id');
            }
        });
    }
};
