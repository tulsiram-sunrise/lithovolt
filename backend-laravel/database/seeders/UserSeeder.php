<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@lithovolt.com',
            'phone' => '9876543210',
            'company_name' => 'LithoVolt',
            'role_id' => 1,
            'password' => Hash::make('password123'),
            'is_verified' => true,
        ]);

        User::create([
            'name' => 'Wholesaler User',
            'email' => 'wholesaler@lithovolt.com',
            'phone' => '9876543211',
            'company_name' => 'WholeSale Inc',
            'role_id' => 2,
            'password' => Hash::make('password123'),
            'is_verified' => true,
        ]);

        User::create([
            'name' => 'Retailer User',
            'email' => 'retailer@lithovolt.com',
            'phone' => '9876543212',
            'company_name' => 'Retail Store',
            'role_id' => 3,
            'password' => Hash::make('password123'),
            'is_verified' => true,
        ]);

        User::create([
            'name' => 'Customer User',
            'email' => 'customer@lithovolt.com',
            'phone' => '9876543213',
            'company_name' => 'Personal',
            'role_id' => 4,
            'password' => Hash::make('password123'),
            'is_verified' => false,
        ]);
    }
}
