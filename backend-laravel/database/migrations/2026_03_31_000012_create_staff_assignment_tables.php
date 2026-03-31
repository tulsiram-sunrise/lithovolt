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
        if (!Schema::hasTable('order_staff_assignments')) {
            Schema::create('order_staff_assignments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();

                $table->unique(['order_id', 'user_id'], 'osa_order_user_uniq');
                $table->index('user_id', 'osa_user_idx');
            });
        }

        if (!Schema::hasTable('warranty_claim_staff_assignments')) {
            Schema::create('warranty_claim_staff_assignments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('warranty_claim_id')->constrained('warranty_claims')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();

                $table->unique(['warranty_claim_id', 'user_id'], 'wcsa_claim_user_uniq');
                $table->index('user_id', 'wcsa_user_idx');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warranty_claim_staff_assignments');
        Schema::dropIfExists('order_staff_assignments');
    }
};
