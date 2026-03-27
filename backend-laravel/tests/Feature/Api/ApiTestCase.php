<?php

namespace Tests\Feature\Api;

use App\Models\Role;
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
}
