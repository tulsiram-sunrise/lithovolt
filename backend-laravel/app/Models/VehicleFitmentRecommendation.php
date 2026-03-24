<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleFitmentRecommendation extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_fitment_id', 'battery_model_id', 'recommendation_type',
        'priority', 'fitment_notes',
    ];

    protected $casts = [
        'priority' => 'integer',
    ];

    public function fitment(): BelongsTo
    {
        return $this->belongsTo(VehicleFitment::class, 'vehicle_fitment_id');
    }

    public function batteryModel(): BelongsTo
    {
        return $this->belongsTo(BatteryModel::class);
    }
}
