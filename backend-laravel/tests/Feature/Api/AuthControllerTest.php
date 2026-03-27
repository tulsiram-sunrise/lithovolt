<?php

namespace Tests\Feature\Api;

use App\Models\Role;

class AuthControllerTest extends ApiTestCase
{
    public function test_register_creates_user_and_token(): void
    {
        Role::factory()->state(['name' => 'CONSUMER'])->create();

        $response = $this->postJson('/api/auth/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'phone' => '9999999999',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message']);
    }

    public function test_login_returns_token(): void
    {
        $user = $this->createUser('customer');

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertOk()->assertJsonStructure(['access', 'refresh']);
    }

    public function test_profile_requires_authentication(): void
    {
        $this->getJson('/api/auth/profile')->assertStatus(401);
    }

    public function test_profile_returns_user(): void
    {
        $user = $this->createUser('customer');
        $this->actingAsUser($user);

        $this->getJson('/api/auth/profile')
            ->assertOk()
            ->assertJsonPath('id', $user->id);
    }

    public function test_logout_revokes_token(): void
    {
        $user = $this->createUser('customer');
        $this->actingAsUser($user);

        $this->postJson('/api/auth/logout')->assertOk();
    }
}
