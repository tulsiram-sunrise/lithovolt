<?php

namespace Tests\Feature\Api;

use App\Models\Notification;

class NotificationControllerTest extends ApiTestCase
{
    public function test_index_returns_notifications(): void
    {
        $user = $this->createUser('admin');
        Notification::factory()->count(2)->create(['user_id' => $user->id]);
        $this->actingAsUser($user);

        $this->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_store_creates_notification(): void
    {
        $user = $this->createUser('admin');
        $recipient = $this->createUser('customer');
        $this->actingAsUser($user);

        $response = $this->postJson('/api/notifications', [
            'user_id' => $recipient->id,
            'type' => 'email',
            'subject' => 'Test',
            'message' => 'Hello',
            'status' => 'pending',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('notifications', ['user_id' => $recipient->id, 'subject' => 'Test']);
    }

    public function test_show_returns_notification(): void
    {
        $user = $this->createUser('admin');
        $notification = Notification::factory()->create(['user_id' => $user->id]);
        $this->actingAsUser($user);

        $this->getJson('/api/notifications/' . $notification->id)
            ->assertOk()
            ->assertJsonPath('id', $notification->id);
    }

    public function test_mark_as_read_updates_status(): void
    {
        $user = $this->createUser('admin');
        $notification = Notification::factory()->create(['user_id' => $user->id, 'status' => 'pending']);
        $this->actingAsUser($user);

        $this->postJson('/api/notifications/' . $notification->id . '/read')
            ->assertOk();

        $this->assertDatabaseHas('notifications', ['id' => $notification->id, 'status' => 'sent']);
    }

    public function test_user_notifications_returns_current_user_notifications(): void
    {
        $user = $this->createUser('admin');
        Notification::factory()->count(2)->create(['user_id' => $user->id]);
        $this->actingAsUser($user);

        $this->getJson('/api/notifications/my')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_unread_count_returns_count(): void
    {
        $user = $this->createUser('admin');
        Notification::factory()->count(2)->create(['user_id' => $user->id, 'status' => 'pending']);
        $this->actingAsUser($user);

        $this->getJson('/api/notifications/unread-count')
            ->assertOk()
            ->assertJsonStructure(['unread_count']);
    }

    public function test_non_owner_cannot_view_notification(): void
    {
        $ownerRole = $this->createRole('customer');
        $owner = \App\Models\User::factory()->create(['role_id' => $ownerRole->id]);
        $otherUser = \App\Models\User::factory()->create(['role_id' => $ownerRole->id]);
        $notification = Notification::factory()->create(['user_id' => $owner->id]);

        $this->actingAsUser($otherUser);

        $this->getJson('/api/notifications/' . $notification->id)
            ->assertStatus(403)
            ->assertJsonPath('message', 'Forbidden');
    }

    public function test_non_owner_cannot_mark_notification_as_read(): void
    {
        $ownerRole = $this->createRole('customer');
        $owner = \App\Models\User::factory()->create(['role_id' => $ownerRole->id]);
        $otherUser = \App\Models\User::factory()->create(['role_id' => $ownerRole->id]);
        $notification = Notification::factory()->create(['user_id' => $owner->id, 'status' => 'pending']);

        $this->actingAsUser($otherUser);

        $this->postJson('/api/notifications/' . $notification->id . '/read')
            ->assertStatus(403)
            ->assertJsonPath('message', 'Forbidden');
    }

    public function test_non_admin_cannot_create_notification_for_other_user(): void
    {
        $ownerRole = $this->createRole('customer');
        $actor = \App\Models\User::factory()->create(['role_id' => $ownerRole->id]);
        $recipient = \App\Models\User::factory()->create(['role_id' => $ownerRole->id]);

        $this->actingAsUser($actor);

        $this->postJson('/api/notifications', [
            'user_id' => $recipient->id,
            'type' => 'email',
            'subject' => 'Unauthorized send',
            'message' => 'Should fail',
            'status' => 'pending',
        ])
            ->assertStatus(403)
            ->assertJsonPath('message', 'You can only create notifications for your own account.');
    }
}
