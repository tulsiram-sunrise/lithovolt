<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wholesaler_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('business_name');
            $table->string('registration_number');
            $table->string('status')->default('pending');
            $table->text('review_notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->unique('user_id');
            $table->index(['status', 'updated_at']);
        });

        if (Schema::hasColumn('users', 'company_name') && Schema::hasColumn('users', 'company_registration')) {
            $wholesalerRoleId = DB::table('roles')->where('name', 'WHOLESALER')->value('id');

            $legacyUsers = DB::table('users')
                ->whereNotNull('company_name')
                ->whereNotNull('company_registration')
                ->get();

            foreach ($legacyUsers as $user) {
                $status = 'pending';

                if ($wholesalerRoleId && (int) $user->role_id === (int) $wholesalerRoleId) {
                    $status = 'approved';
                } elseif (is_string($user->verification_code) && str_starts_with($user->verification_code, 'WHOLESALER_APP:')) {
                    $legacyStatus = str_replace('WHOLESALER_APP:', '', $user->verification_code);
                    if (in_array($legacyStatus, ['pending', 'approved', 'rejected'], true)) {
                        $status = $legacyStatus;
                    }
                }

                DB::table('wholesaler_applications')->updateOrInsert(
                    ['user_id' => $user->id],
                    [
                        'business_name' => $user->company_name,
                        'registration_number' => $user->company_registration,
                        'status' => $status,
                        'created_at' => $user->created_at ?? now(),
                        'updated_at' => $user->updated_at ?? now(),
                    ]
                );
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('wholesaler_applications');
    }
};
