<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Get role IDs dynamically to avoid hardcoding
        $adminRole = \App\Models\Role::where('name', 'ADMIN')->first();
        $wholesalerRole = \App\Models\Role::where('name', 'WHOLESALER')->first();
        $retailerRole = \App\Models\Role::where('name', 'RETAILER')->first();
        $consumerRole = \App\Models\Role::where('name', 'CONSUMER')->first();

        User::updateOrCreate(
            ['email' => 'admin@lithovolt.com.au'],
            [
                'first_name' => 'Admin',
                'last_name' => 'User',
                'phone' => '9876543210',
                'role_id' => $adminRole?->id ?? 1,
                'password' => Hash::make('password123'),
                'is_verified' => true,
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'wholesaler@lithovolt.com.au'],
            [
                'first_name' => 'Wholesaler',
                'last_name' => 'User',
                'phone' => '9876543211',
                'role_id' => $wholesalerRole?->id ?? 2,
                'password' => Hash::make('password123'),
                'is_verified' => true,
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'retailer@lithovolt.com.au'],
            [
                'first_name' => 'Retailer',
                'last_name' => 'User',
                'phone' => '9876543212',
                'role_id' => $retailerRole?->id ?? 3,
                'password' => Hash::make('password123'),
                'is_verified' => true,
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'customer@lithovolt.com.au'],
            [
                'first_name' => 'Customer',
                'last_name' => 'User',
                'phone' => '9876543213',
                'role_id' => $consumerRole?->id ?? 4,
                'password' => Hash::make('password123'),
                'is_verified' => false,
                'email_verified_at' => null,
                'is_active' => true,
            ]
        );
    }
}
