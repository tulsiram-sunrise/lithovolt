<?php

namespace Database\Factories;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => fake()->randomElement(['email', 'sms', 'push']),
            'subject' => fake()->sentence(),
            'message' => fake()->paragraph(),
            'status' => fake()->randomElement(['pending', 'sent', 'failed']),
            'sent_at' => now(),
        ];
    }
}
