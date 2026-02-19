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
        // Add is_active column to roles table if it doesn't exist
        if (Schema::hasTable('roles') && !Schema::hasColumn('roles', 'is_active')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->boolean('is_active')->default(true)->after('description');
            });
        }

        // Create permissions table
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained('roles')->onDelete('cascade');
            $table->string('resource'); // INVENTORY, ORDERS, WARRANTY_CLAIMS, USERS, REPORTS, SETTINGS
            $table->string('action'); // VIEW, CREATE, UPDATE, DELETE, APPROVE, ASSIGN
            $table->text('description')->nullable();
            $table->timestamps();
            $table->unique(['role_id', 'resource', 'action']);
        });

        // Create staff_users table
        Schema::create('staff_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->foreignId('role_id')->nullable()->constrained('roles')->onDelete('set null');
            $table->foreignId('supervisor_id')->nullable()->constrained('users', 'id')->onDelete('set null');
            $table->date('hire_date')->useCurrent();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_users');
        Schema::dropIfExists('permissions');
        
        if (Schema::hasTable('roles') && Schema::hasColumn('roles', 'is_active')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->dropColumn('is_active');
            });
        }
    }
};
