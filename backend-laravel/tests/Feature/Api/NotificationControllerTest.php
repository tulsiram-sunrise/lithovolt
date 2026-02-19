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

        $this->getJson('/api/v1/notifications')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_store_creates_notification(): void
    {
        $user = $this->createUser('admin');
        $recipient = $this->createUser('customer');
        $this->actingAsUser($user);

        $response = $this->postJson('/api/v1/notifications', [
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

        $this->getJson('/api/v1/notifications/' . $notification->id)
            ->assertOk()
            ->assertJsonPath('id', $notification->id);
    }

    public function test_mark_as_read_updates_status(): void
    {
        $user = $this->createUser('admin');
        $notification = Notification::factory()->create(['user_id' => $user->id, 'status' => 'pending']);
        $this->actingAsUser($user);

        $this->postJson('/api/v1/notifications/' . $notification->id . '/read')
            ->assertOk();

        $this->assertDatabaseHas('notifications', ['id' => $notification->id, 'status' => 'sent']);
    }

    public function test_user_notifications_returns_current_user_notifications(): void
    {
        $user = $this->createUser('admin');
        Notification::factory()->count(2)->create(['user_id' => $user->id]);
        $this->actingAsUser($user);

        $this->getJson('/api/v1/my-notifications')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_unread_count_returns_count(): void
    {
        $user = $this->createUser('admin');
        Notification::factory()->count(2)->create(['user_id' => $user->id, 'status' => 'pending']);
        $this->actingAsUser($user);

        $this->getJson('/api/v1/notifications/unread-count')
            ->assertOk()
            ->assertJsonStructure(['unread_count']);
    }
}
