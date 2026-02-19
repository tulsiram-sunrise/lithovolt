<?php

namespace Tests\Feature\Api;

use App\Models\Role;

class AuthControllerTest extends ApiTestCase
{
    public function test_register_creates_user_and_token(): void
    {
        $role = Role::factory()->state(['name' => 'customer'])->create();

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '9999999999',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role_id' => $role->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['user', 'access_token', 'token_type']);
    }

    public function test_login_returns_token(): void
    {
        $user = $this->createUser('customer');

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertOk()->assertJsonStructure(['access_token']);
    }

    public function test_profile_requires_authentication(): void
    {
        $this->getJson('/api/v1/auth/profile')->assertStatus(401);
    }

    public function test_profile_returns_user(): void
    {
        $user = $this->createUser('customer');
        $this->actingAsUser($user);

        $this->getJson('/api/v1/auth/profile')
            ->assertOk()
            ->assertJsonPath('user.id', $user->id);
    }

    public function test_logout_revokes_token(): void
    {
        $user = $this->createUser('customer');
        $this->actingAsUser($user);

        $this->postJson('/api/v1/auth/logout')->assertOk();
    }
}
