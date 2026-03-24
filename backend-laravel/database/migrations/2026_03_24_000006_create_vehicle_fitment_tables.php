<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_fitments', function (Blueprint $table) {
            $table->id();
            $table->string('market', 8)->default('AU');
            $table->string('state_code', 8)->nullable();
            $table->string('make', 80);
            $table->string('model', 120);
            $table->string('variant', 120)->nullable();
            $table->unsignedSmallInteger('year_from')->nullable();
            $table->unsignedSmallInteger('year_to')->nullable();
            $table->string('engine_code', 40)->nullable();
            $table->string('engine_liters', 20)->nullable();
            $table->string('fuel_type', 40)->nullable();
            $table->string('body_type', 40)->nullable();
            $table->string('drivetrain', 40)->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['market', 'make', 'model']);
            $table->index(['year_from', 'year_to']);
        });

        Schema::create('vehicle_fitment_recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_fitment_id')->constrained('vehicle_fitments')->cascadeOnDelete();
            $table->foreignId('battery_model_id')->constrained('battery_models')->cascadeOnDelete();
            $table->string('recommendation_type', 30)->default('PRIMARY');
            $table->unsignedSmallInteger('priority')->default(1);
            $table->text('fitment_notes')->nullable();
            $table->timestamps();

            $table->unique(['vehicle_fitment_id', 'battery_model_id', 'recommendation_type'], 'vehicle_fitment_battery_unique');
            $table->index(['vehicle_fitment_id', 'priority'], 'vfr_fitment_priority_idx');
        });

        Schema::create('registration_lookup_cache', function (Blueprint $table) {
            $table->id();
            $table->string('market', 8)->default('AU');
            $table->string('state_code', 8)->nullable();
            $table->string('registration_number', 32);
            $table->string('provider', 80)->default('none');
            $table->foreignId('vehicle_fitment_id')->nullable()->constrained('vehicle_fitments')->nullOnDelete();
            $table->json('vehicle_payload')->nullable();
            $table->timestamp('looked_up_at');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['market', 'state_code', 'registration_number'], 'registration_lookup_idx');
            $table->index(['expires_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registration_lookup_cache');
        Schema::dropIfExists('vehicle_fitment_recommendations');
        Schema::dropIfExists('vehicle_fitments');
    }
};
