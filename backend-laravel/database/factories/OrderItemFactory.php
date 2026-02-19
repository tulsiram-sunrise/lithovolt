<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\BatteryModel;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'itemable_type' => BatteryModel::class,
            'itemable_id' => BatteryModel::factory(),
            'quantity' => fake()->numberBetween(1, 5),
            'unit_price' => fake()->randomFloat(2, 100, 5000),
            'total_price' => fake()->randomFloat(2, 100, 25000),
        ];
    }
}
