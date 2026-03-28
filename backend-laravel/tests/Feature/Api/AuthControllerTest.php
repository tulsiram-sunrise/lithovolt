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

    public function test_send_otp_supports_email_channel(): void
    {
        $user = $this->createUser('customer');

        $response = $this->postJson('/api/auth/otp/send', [
            'email' => $user->email,
        ]);

        $response->assertOk()
            ->assertJsonPath('channel', 'email')
            ->assertJsonPath('message', 'OTP sent successfully');

        $this->assertNotNull($response->json('otp'));
    }

    public function test_verify_otp_with_email_returns_tokens_and_marks_user_verified(): void
    {
        $user = $this->createUser('customer');
        $user->update([
            'is_verified' => false,
            'email_verified_at' => null,
        ]);

        $sendResponse = $this->postJson('/api/auth/otp/send', [
            'email' => $user->email,
        ]);

        $otp = (string) $sendResponse->json('otp');

        $verifyResponse = $this->postJson('/api/auth/otp/verify', [
            'email' => $user->email,
            'otp' => $otp,
        ]);

        $verifyResponse->assertOk()->assertJsonStructure(['access', 'refresh', 'user']);

        $user->refresh();
        $this->assertTrue((bool) $user->is_verified);
        $this->assertNotNull($user->email_verified_at);
    }

    public function test_verify_otp_with_email_rejects_invalid_code(): void
    {
        $user = $this->createUser('customer');

        $this->postJson('/api/auth/otp/send', [
            'email' => $user->email,
        ])->assertOk();

        $this->postJson('/api/auth/otp/verify', [
            'email' => $user->email,
            'otp' => '000000',
        ])
            ->assertStatus(401)
            ->assertJsonPath('error', 'Invalid or expired OTP');
    }

    public function test_send_otp_hides_raw_otp_when_debug_disabled(): void
    {
        $user = $this->createUser('customer');
        config(['app.debug' => false]);

        $response = $this->postJson('/api/auth/otp/send', [
            'email' => $user->email,
        ]);

        $response->assertOk()
            ->assertJsonPath('channel', 'email')
            ->assertJsonMissingPath('otp');
    }
}
