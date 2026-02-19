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
        'name', 'description', 'sku', 'voltage', 'capacity', 
        'chemistry', 'total_quantity', 'available_quantity', 'price', 
        'status', 'warranty_months'
    ];

    protected $casts = [
        'voltage' => 'float',
        'capacity' => 'float',
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
