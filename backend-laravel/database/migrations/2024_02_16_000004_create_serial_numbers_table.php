<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('serial_numbers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('battery_model_id')->constrained()->onDelete('cascade');
            $table->string('serial_number')->unique();
            $table->string('status')->default('available'); // available, allocated, sold, returned
            $table->foreignId('allocated_to')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('allocated_date')->nullable();
            $table->timestamp('sold_date')->nullable();
            $table->foreignId('sold_to')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('serial_numbers');
    }
};
