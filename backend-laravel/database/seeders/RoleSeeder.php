<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('roles')->insert([
            [
                'name' => 'admin',
                'description' => 'Administrator with full access',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'wholesaler',
                'description' => 'Wholesaler user',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'retailer',
                'description' => 'Retailer user',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'customer',
                'description' => 'End customer',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
