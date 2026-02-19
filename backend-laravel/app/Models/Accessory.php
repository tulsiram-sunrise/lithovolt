<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Accessory extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'description', 'sku', 'total_quantity', 
        'available_quantity', 'price', 'status'
    ];

    protected $casts = [
        'price' => 'float',
        'total_quantity' => 'integer',
        'available_quantity' => 'integer',
    ];

    public function orderItems()
    {
        return $this->morphMany(OrderItem::class, 'itemable');
    }
}
