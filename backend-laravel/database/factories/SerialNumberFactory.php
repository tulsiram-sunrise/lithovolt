<?php

namespace Database\Factories;

use App\Models\BatteryModel;
use App\Models\SerialNumber;
use Illuminate\Database\Eloquent\Factories\Factory;

class SerialNumberFactory extends Factory
{
    protected $model = SerialNumber::class;

    public function definition(): array
    {
        return [
            'battery_model_id' => BatteryModel::factory(),
            'serial_number' => fake()->unique()->bothify('SN-########'),
            'status' => 'unallocated',
            'allocated_to' => null,
            'allocated_date' => null,
            'sold_to' => null,
            'sold_date' => null,
        ];
    }
}
