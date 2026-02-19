<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Warranty;
use App\Models\WarrantyClaim;
use Illuminate\Database\Eloquent\Factories\Factory;

class WarrantyClaimFactory extends Factory
{
    protected $model = WarrantyClaim::class;

    public function definition(): array
    {
        return [
            'warranty_id' => Warranty::factory(),
            'user_id' => User::factory(),
            'claim_number' => fake()->unique()->bothify('CLM-#####'),
            'complaint_description' => fake()->sentence(),
            'status' => 'submitted',
            'resolution' => null,
            'resolved_date' => null,
        ];
    }
}
