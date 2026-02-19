<?php

namespace Database\Factories;

use App\Models\Accessory;
use Illuminate\Database\Eloquent\Factories\Factory;

class AccessoryFactory extends Factory
{
    protected $model = Accessory::class;

    public function definition(): array
    {
        $total = fake()->numberBetween(10, 200);
        $available = fake()->numberBetween(0, $total);

        return [
            'name' => fake()->words(2, true),
            'description' => fake()->sentence(),
            'sku' => fake()->unique()->bothify('ACC-###-??'),
            'total_quantity' => $total,
            'available_quantity' => $available,
            'price' => fake()->randomFloat(2, 50, 2000),
            'status' => 'active',
        ];
    }
}
