<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class BatteryModel extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'brand', 'series', 'description', 'sku', 'model_code', 'group_size',
        'voltage', 'capacity', 'chemistry', 'battery_type', 'cca', 'reserve_capacity',
        'capacity_ah', 'length_mm', 'width_mm', 'height_mm', 'total_height_mm',
        'terminal_type', 'terminal_layout', 'hold_down', 'vent_type', 'maintenance_free',
        'private_warranty_months', 'commercial_warranty_months', 'unit_weight_kg',
        'datasheet_url', 'application_segment', 'specs',
        'total_quantity', 'available_quantity', 'price', 'status', 'warranty_months'
    ];

    protected $casts = [
        'voltage' => 'float',
        'capacity' => 'float',
        'capacity_ah' => 'float',
        'length_mm' => 'float',
        'width_mm' => 'float',
        'height_mm' => 'float',
        'total_height_mm' => 'float',
        'unit_weight_kg' => 'float',
        'cca' => 'integer',
        'reserve_capacity' => 'integer',
        'maintenance_free' => 'boolean',
        'private_warranty_months' => 'integer',
        'commercial_warranty_months' => 'integer',
        'specs' => 'array',
        'price' => 'float',
        'total_quantity' => 'integer',
        'available_quantity' => 'integer',
        'warranty_months' => 'integer',
    ];

    public function serialNumbers(): HasMany
    {
        return $this->hasMany(SerialNumber::class);
    }

    public function warranties(): HasMany
    {
        return $this->hasMany(Warranty::class);
    }

    public function orderItems()
    {
        return $this->morphMany(OrderItem::class, 'itemable');
    }
}
