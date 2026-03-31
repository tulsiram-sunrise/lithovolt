<?php

namespace Tests\Feature\Api;

use App\Models\Permission;
use App\Models\Role;
use App\Models\StaffUser;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

abstract class ApiTestCase extends TestCase
{
    use RefreshDatabase;

    protected function createRole(string $name): Role
    {
        return Role::factory()->state([
            'name' => $name,
            'description' => ucfirst($name),
        ])->create();
    }

    protected function createUser(string $roleName = 'customer'): User
    {
        $role = $this->createRole($roleName);

        return User::factory()->create([
            'role_id' => $role->id,
        ]);
    }

    protected function actingAsUser(User $user): void
    {
        $token = JWTAuth::fromUser($user);
        $this->withHeader('Authorization', 'Bearer ' . $token);
    }

    /**
     * Create an authenticated admin with the required backoffice permissions.
     */
    protected function actingAsBackofficeAdmin(array $permissions = ['USERS:VIEW', 'USERS:CREATE', 'USERS:UPDATE', 'USERS:DELETE']): User
    {
        $adminRole = $this->createRole('ADMIN');

        foreach ($permissions as $permission) {
            [$resource, $action] = explode(':', strtoupper($permission), 2);
            Permission::firstOrCreate([
                'role_id' => $adminRole->id,
                'resource' => $resource,
                'action' => $action,
            ], [
                'description' => "{$resource} {$action}",
            ]);
        }

        $admin = User::factory()->create([
            'role_id' => $adminRole->id,
            'email' => 'admin@lithovolt.com.au',
        ]);

        StaffUser::create([
            'user_id' => $admin->id,
            'role_id' => $adminRole->id,
            'hire_date' => now()->toDateString(),
            'is_active' => true,
        ]);

        $this->actingAsUser($admin);

        return $admin;
    }
}
