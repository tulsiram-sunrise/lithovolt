<?php

namespace Database\Factories;

use App\Models\BatteryModel;
use Illuminate\Database\Eloquent\Factories\Factory;

class BatteryModelFactory extends Factory
{
    protected $model = BatteryModel::class;

    public function definition(): array
    {
        $total = fake()->numberBetween(10, 200);
        $available = fake()->numberBetween(0, $total);

        return [
            'name' => 'LithoVolt ' . fake()->word(),
            'description' => fake()->sentence(),
            'sku' => fake()->unique()->bothify('LV-###-??'),
            'voltage' => fake()->randomFloat(1, 12, 120),
            'capacity' => fake()->randomFloat(1, 10, 200),
            'chemistry' => fake()->randomElement(['LiFePO4', 'NMC']),
            'total_quantity' => $total,
            'available_quantity' => $available,
            'price' => fake()->randomFloat(2, 1000, 20000),
            'status' => 'active',
            'warranty_months' => fake()->numberBetween(12, 72),
        ];
    }
}
