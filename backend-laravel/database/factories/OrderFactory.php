<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'order_number' => fake()->unique()->bothify('ORD-#####'),
            'user_id' => User::factory(),
            'total_amount' => fake()->randomFloat(2, 100, 50000),
            'status' => 'pending',
            'payment_status' => 'pending',
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
