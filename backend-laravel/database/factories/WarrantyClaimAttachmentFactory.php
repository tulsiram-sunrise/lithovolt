<?php

namespace Database\Factories;

use App\Models\WarrantyClaim;
use App\Models\WarrantyClaimAttachment;
use Illuminate\Database\Eloquent\Factories\Factory;

class WarrantyClaimAttachmentFactory extends Factory
{
    protected $model = WarrantyClaimAttachment::class;

    public function definition(): array
    {
        return [
            'warranty_claim_id' => WarrantyClaim::factory(),
            'file_path' => fake()->filePath(),
            'file_type' => 'image/jpeg',
            'file_name' => fake()->word() . '.jpg',
        ];
    }
}
