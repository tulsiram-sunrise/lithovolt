<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->enum('product_type', ['BATTERY', 'ACCESSORY', 'PART', 'CONSUMABLE', 'SERVICE', 'GENERIC'])
                ->default('GENERIC')
                ->after('name');
            $table->boolean('is_serialized')->default(false)->after('product_type');
            $table->boolean('is_warranty_eligible')->default(false)->after('is_serialized');
            $table->boolean('is_fitment_eligible')->default(false)->after('is_warranty_eligible');
            $table->unsignedInteger('default_warranty_months')->nullable()->after('is_fitment_eligible');

            $table->foreignId('legacy_battery_model_id')
                ->nullable()
                ->after('category_id')
                ->constrained('battery_models')
                ->nullOnDelete();
            $table->foreignId('legacy_accessory_id')
                ->nullable()
                ->after('legacy_battery_model_id')
                ->constrained('accessories')
                ->nullOnDelete();

            $table->index('product_type');
            $table->index(['product_type', 'is_active']);
            $table->unique('legacy_battery_model_id');
            $table->unique('legacy_accessory_id');
        });

        Schema::table('serial_numbers', function (Blueprint $table) {
            $table->foreignId('product_id')
                ->nullable()
                ->after('battery_model_id')
                ->constrained('products')
                ->nullOnDelete();
            $table->index('product_id');
        });

        Schema::table('warranties', function (Blueprint $table) {
            $table->foreignId('product_id')
                ->nullable()
                ->after('battery_model_id')
                ->constrained('products')
                ->nullOnDelete();
            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::table('warranties', function (Blueprint $table) {
            $table->dropIndex(['product_id']);
            $table->dropConstrainedForeignId('product_id');
        });

        Schema::table('serial_numbers', function (Blueprint $table) {
            $table->dropIndex(['product_id']);
            $table->dropConstrainedForeignId('product_id');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropUnique(['legacy_battery_model_id']);
            $table->dropUnique(['legacy_accessory_id']);
            $table->dropIndex(['product_type']);
            $table->dropIndex(['product_type', 'is_active']);

            $table->dropConstrainedForeignId('legacy_accessory_id');
            $table->dropConstrainedForeignId('legacy_battery_model_id');
            $table->dropColumn([
                'product_type',
                'is_serialized',
                'is_warranty_eligible',
                'is_fitment_eligible',
                'default_warranty_months',
            ]);
        });
    }
};
