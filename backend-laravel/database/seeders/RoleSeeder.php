<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Delete old lowercase roles (these will cause conflicts)
        Role::whereIn('name', ['admin', 'wholesaler', 'retailer', 'customer'])->delete();
        
        // Create or update roles with uppercase names
        Role::updateOrCreate(
            ['name' => 'ADMIN'],
            ['id' => 1, 'description' => 'Administrator with full access']
        );
        Role::updateOrCreate(
            ['name' => 'WHOLESALER'],
            ['id' => 2, 'description' => 'Wholesaler user']
        );
        Role::updateOrCreate(
            ['name' => 'RETAILER'],
            ['id' => 3, 'description' => 'Retailer user']
        );
        Role::updateOrCreate(
            ['name' => 'CONSUMER'],
            ['id' => 4, 'description' => 'End customer']
        );
    }
}


