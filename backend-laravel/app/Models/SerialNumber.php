<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SerialNumber extends Model
{
    use HasFactory;

    protected $fillable = [
        'battery_model_id', 'serial_number', 'status', 
        'allocated_to', 'allocated_date', 'sold_date', 'sold_to'
    ];

    protected $casts = [
        'allocated_date' => 'datetime',
        'sold_date' => 'datetime',
    ];

    public function batteryModel(): BelongsTo
    {
        return $this->belongsTo(BatteryModel::class);
    }

    public function allocatedToUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'allocated_to');
    }

    public function soldToUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sold_to');
    }
}
