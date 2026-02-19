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
        // Add new columns to warranty_claims table
        if (Schema::hasTable('warranty_claims') && !Schema::hasColumn('warranty_claims', 'assigned_to')) {
            Schema::table('warranty_claims', function (Blueprint $table) {
                $table->foreignId('assigned_to')->nullable()->constrained('users', 'id')->nullOnDelete();
                $table->foreignId('reviewed_by')->nullable()->constrained('users', 'id')->nullOnDelete();
                $table->text('review_notes')->nullable();
                $table->string('status')->default('PENDING')->change();
            });
        }

        // Create claim_status_history table
        Schema::create('claim_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('claim_id')->constrained('warranty_claims')->onDelete('cascade');
            $table->string('from_status');
            $table->string('to_status');
            $table->foreignId('changed_by')->nullable()->constrained('users', 'id')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('claim_status_history');

        if (Schema::hasTable('warranty_claims')) {
            Schema::table('warranty_claims', function (Blueprint $table) {
                $table->dropForeignKey(['assigned_to']);
                $table->dropForeignKey(['reviewed_by']);
                $table->dropColumn(['assigned_to', 'reviewed_by', 'review_notes']);
            });
        }
    }
};
