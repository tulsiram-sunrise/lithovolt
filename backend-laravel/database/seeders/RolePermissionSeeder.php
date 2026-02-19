<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Create roles
        $roles = [
            'MANAGER' => Role::create([
                'name' => 'MANAGER',
                'description' => 'Management staff role with full access to most resources',
                'is_active' => true,
            ]),
            'SUPPORT' => Role::create([
                'name' => 'SUPPORT',
                'description' => 'Support staff role focused on customer service and warranty claims',
                'is_active' => true,
            ]),
            'SALES' => Role::create([
                'name' => 'SALES',
                'description' => 'Sales staff role for orders and customer management',
                'is_active' => true,
            ]),
            'TECH' => Role::create([
                'name' => 'TECH',
                'description' => 'Technical staff role for inventory and product management',
                'is_active' => true,
            ]),
        ];
        
        // Define permissions per role
        $rolePermissions = [
            'MANAGER' => [
                ['INVENTORY', 'VIEW'], ['INVENTORY', 'CREATE'], ['INVENTORY', 'UPDATE'], 
                ['INVENTORY', 'DELETE'],
                ['ORDERS', 'VIEW'], ['ORDERS', 'CREATE'], ['ORDERS', 'UPDATE'], 
                ['ORDERS', 'APPROVE'], ['ORDERS', 'ASSIGN'],
                ['WARRANTY_CLAIMS', 'VIEW'], ['WARRANTY_CLAIMS', 'APPROVE'], 
                ['WARRANTY_CLAIMS', 'ASSIGN'],
            ],
            'SUPPORT' => [
                ['WARRANTY_CLAIMS', 'VIEW'], ['WARRANTY_CLAIMS', 'UPDATE'], 
                ['WARRANTY_CLAIMS', 'APPROVE'], ['WARRANTY_CLAIMS', 'ASSIGN'],
                ['ORDERS', 'VIEW'],
                ['USERS', 'VIEW'],
                ['REPORTS', 'VIEW'],
            ],
            'SALES' => [
                ['ORDERS', 'VIEW'], ['ORDERS', 'CREATE'], ['ORDERS', 'UPDATE'], 
                ['ORDERS', 'APPROVE'],
                ['USERS', 'VIEW'], ['USERS', 'CREATE'], ['USERS', 'UPDATE'],
                ['INVENTORY', 'VIEW'],
            ],
            'TECH' => [
                ['INVENTORY', 'VIEW'], ['INVENTORY', 'CREATE'], ['INVENTORY', 'UPDATE'], 
                ['INVENTORY', 'DELETE'],
                ['SETTINGS', 'VIEW'], ['SETTINGS', 'UPDATE'],
                ['REPORTS', 'VIEW'],
                ['WARRANTY_CLAIMS', 'VIEW'],
                ['ORDERS', 'VIEW'],
            ],
        ];
        
        // Create permissions
        foreach ($rolePermissions as $roleName => $permissions) {
            $role = $roles[$roleName];
            foreach ($permissions as [$resource, $action]) {
                Permission::create([
                    'role_id' => $role->id,
                    'resource' => $resource,
                    'action' => $action,
                    'description' => "$action $resource",
                ]);
            }
        }
        
        $totalPermissions = collect($rolePermissions)->flatten(1)->count();
        $this->command->info("✅ Seeded " . count($roles) . " roles with ".$totalPermissions." permissions");
    }
}
