<?php

namespace Tests\Feature\Api;

use App\Models\User;

class UserControllerTest extends ApiTestCase
{
    public function test_index_returns_users(): void
    {
        $user = $this->createUser('admin');
        User::factory()->count(3)->create(['role_id' => $user->role_id]);

        $this->actingAsUser($user);

        $this->getJson('/api/v1/users')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_store_creates_user(): void
    {
        $admin = $this->createUser('admin');
        $this->actingAsUser($admin);

        $response = $this->postJson('/api/v1/users', [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'phone' => '8888888888',
            'company_name' => 'New Co',
            'password' => 'password123',
            'role_id' => $admin->role_id,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['user']);
    }

    public function test_show_returns_user(): void
    {
        $admin = $this->createUser('admin');
        $this->actingAsUser($admin);

        $user = $this->createUser('customer');

        $this->getJson('/api/v1/users/' . $user->id)
            ->assertOk()
            ->assertJsonPath('id', $user->id);
    }

    public function test_update_modifies_user(): void
    {
        $admin = $this->createUser('admin');
        $this->actingAsUser($admin);

        $user = $this->createUser('customer');

        $this->putJson('/api/v1/users/' . $user->id, [
            'name' => 'Updated Name',
        ])->assertOk();

        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Updated Name']);
    }

    public function test_verify_email_sets_verified(): void
    {
        $admin = $this->createUser('admin');
        $this->actingAsUser($admin);

        $user = $this->createUser('customer');

        $this->postJson('/api/v1/users/' . $user->id . '/verify')
            ->assertOk();

        $this->assertDatabaseHas('users', ['id' => $user->id, 'is_verified' => true]);
    }

    public function test_destroy_deletes_user(): void
    {
        $admin = $this->createUser('admin');
        $this->actingAsUser($admin);

        $user = $this->createUser('customer');

        $this->deleteJson('/api/v1/users/' . $user->id)->assertOk();
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }
}
