<?php

namespace Database\Factories;

use App\Models\BatteryModel;
use App\Models\User;
use App\Models\Warranty;
use Illuminate\Database\Eloquent\Factories\Factory;

class WarrantyFactory extends Factory
{
    protected $model = Warranty::class;

    public function definition(): array
    {
        $issueDate = fake()->dateTimeBetween('-1 year', 'now');
        $expiryDate = (clone $issueDate)->modify('+1 year');

        return [
            'warranty_number' => fake()->unique()->bothify('WAR-#####'),
            'battery_model_id' => BatteryModel::factory(),
            'user_id' => User::factory(),
            'serial_number' => fake()->bothify('SN-########'),
            'issue_date' => $issueDate->format('Y-m-d'),
            'expiry_date' => $expiryDate->format('Y-m-d'),
            'status' => 'active',
            'qr_code' => fake()->uuid(),
        ];
    }
}
