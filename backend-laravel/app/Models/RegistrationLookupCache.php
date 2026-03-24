<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RegistrationLookupCache extends Model
{
    use HasFactory;

    protected $table = 'registration_lookup_cache';

    protected $fillable = [
        'market', 'state_code', 'registration_number', 'provider',
        'vehicle_fitment_id', 'vehicle_payload', 'looked_up_at', 'expires_at',
    ];

    protected $casts = [
        'vehicle_payload' => 'array',
        'looked_up_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function fitment(): BelongsTo
    {
        return $this->belongsTo(VehicleFitment::class, 'vehicle_fitment_id');
    }
}
