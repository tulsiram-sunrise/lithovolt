<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VehicleFitment extends Model
{
    use HasFactory;

    protected $fillable = [
        'market', 'state_code', 'make', 'model', 'variant',
        'year_from', 'year_to', 'engine_code', 'engine_liters',
        'fuel_type', 'body_type', 'drivetrain', 'is_active', 'notes',
    ];

    protected $casts = [
        'year_from' => 'integer',
        'year_to' => 'integer',
        'is_active' => 'boolean',
    ];

    public function recommendations(): HasMany
    {
        return $this->hasMany(VehicleFitmentRecommendation::class)->orderBy('priority');
    }
}
