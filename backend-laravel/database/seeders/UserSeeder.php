<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@lithovolt.com'],
            [
                'first_name' => 'Admin',
                'last_name' => 'User',
                'phone' => '9876543210',
                'role_id' => 1,
                'password' => Hash::make('password123'),
                'is_verified' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'wholesaler@lithovolt.com'],
            [
                'first_name' => 'Wholesaler',
                'last_name' => 'User',
                'phone' => '9876543211',
                'role_id' => 2,
                'password' => Hash::make('password123'),
                'is_verified' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'retailer@lithovolt.com'],
            [
                'first_name' => 'Retailer',
                'last_name' => 'User',
                'phone' => '9876543212',
                'role_id' => 3,
                'password' => Hash::make('password123'),
                'is_verified' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'customer@lithovolt.com'],
            [
                'first_name' => 'Customer',
                'last_name' => 'User',
                'phone' => '9876543213',
                'role_id' => 4,
                'password' => Hash::make('password123'),
                'is_verified' => false,
            ]
        );
    }
}
