<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('entity_type', 120);
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->string('event_type', 24); // created|updated|deleted
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->json('changed_fields')->nullable();
            $table->string('request_method', 16)->nullable();
            $table->string('request_path')->nullable();
            $table->string('ip_address', 64)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->index(['entity_type', 'entity_id']);
            $table->index(['event_type', 'created_at']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
