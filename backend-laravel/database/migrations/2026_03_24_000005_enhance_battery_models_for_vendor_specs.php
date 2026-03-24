<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('battery_models', function (Blueprint $table) {
            $table->string('brand', 120)->nullable()->after('name');
            $table->string('series', 120)->nullable()->after('brand');
            $table->string('model_code', 120)->nullable()->after('sku');
            $table->string('group_size', 120)->nullable()->after('model_code');
            $table->string('battery_type', 120)->nullable()->after('chemistry');
            $table->integer('cca')->nullable()->after('battery_type');
            $table->integer('reserve_capacity')->nullable()->after('cca');
            $table->decimal('capacity_ah', 8, 2)->nullable()->after('reserve_capacity');
            $table->decimal('length_mm', 8, 2)->nullable()->after('capacity_ah');
            $table->decimal('width_mm', 8, 2)->nullable()->after('length_mm');
            $table->decimal('height_mm', 8, 2)->nullable()->after('width_mm');
            $table->decimal('total_height_mm', 8, 2)->nullable()->after('height_mm');
            $table->string('terminal_type', 40)->nullable()->after('total_height_mm');
            $table->string('terminal_layout', 40)->nullable()->after('terminal_type');
            $table->string('hold_down', 80)->nullable()->after('terminal_layout');
            $table->string('vent_type', 40)->nullable()->after('hold_down');
            $table->boolean('maintenance_free')->nullable()->after('vent_type');
            $table->integer('private_warranty_months')->nullable()->after('maintenance_free');
            $table->integer('commercial_warranty_months')->nullable()->after('private_warranty_months');
            $table->decimal('unit_weight_kg', 8, 2)->nullable()->after('commercial_warranty_months');
            $table->string('datasheet_url', 500)->nullable()->after('unit_weight_kg');
            $table->string('application_segment', 180)->nullable()->after('datasheet_url');
            $table->json('specs')->nullable()->after('application_segment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('battery_models', function (Blueprint $table) {
            $table->dropColumn([
                'brand',
                'series',
                'model_code',
                'group_size',
                'battery_type',
                'cca',
                'reserve_capacity',
                'capacity_ah',
                'length_mm',
                'width_mm',
                'height_mm',
                'total_height_mm',
                'terminal_type',
                'terminal_layout',
                'hold_down',
                'vent_type',
                'maintenance_free',
                'private_warranty_months',
                'commercial_warranty_months',
                'unit_weight_kg',
                'datasheet_url',
                'application_segment',
                'specs',
            ]);
        });
    }
};
