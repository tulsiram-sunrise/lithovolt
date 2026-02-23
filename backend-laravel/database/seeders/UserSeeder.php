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
                'name' => 'Admin User',
                'phone' => '9876543210',
                'company_name' => 'LithoVolt',
                'role_id' => 1,
                'password' => Hash::make('password123'),
                'is_verified' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'wholesaler@lithovolt.com'],
            [
                'name' => 'Wholesaler User',
                'phone' => '9876543211',
                'company_name' => 'WholeSale Inc',
                'role_id' => 2,
                'password' => Hash::make('password123'),
                'is_verified' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'retailer@lithovolt.com'],
            [
                'name' => 'Retailer User',
                'phone' => '9876543212',
                'company_name' => 'Retail Store',
                'role_id' => 3,
                'password' => Hash::make('password123'),
                'is_verified' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'customer@lithovolt.com'],
            [
                'name' => 'Customer User',
                'phone' => '9876543213',
                'company_name' => 'Personal',
                'role_id' => 4,
                'password' => Hash::make('password123'),
                'is_verified' => false,
            ]
        );
    }
}
