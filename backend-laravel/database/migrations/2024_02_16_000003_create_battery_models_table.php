<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('battery_models', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('sku')->unique();
            $table->double('voltage', 8, 2);
            $table->double('capacity', 8, 2);
            $table->string('chemistry');
            $table->integer('total_quantity')->default(0);
            $table->integer('available_quantity')->default(0);
            $table->double('price', 10, 2);
            $table->string('status')->default('active');
            $table->integer('warranty_months')->default(24);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('battery_models');
    }
};
