<?php

namespace Database\Factories;

use App\Models\NotificationSetting;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class NotificationSettingFactory extends Factory
{
    protected $model = NotificationSetting::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'email_notifications' => true,
            'sms_notifications' => false,
            'push_notifications' => true,
        ];
    }
}
