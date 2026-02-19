<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->constrained('roles')->onDelete('set null');
            $table->string('phone')->nullable();
            $table->string('company_name')->nullable();
            $table->string('company_registration')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->string('verification_code')->nullable();
            $table->timestamp('email_verified_at')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeignIdFor('roles');
            $table->dropColumn(['role_id', 'phone', 'company_name', 'company_registration', 'is_verified', 'verification_code']);
        });
    }
};
