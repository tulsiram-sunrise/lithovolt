<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = ['order_id', 'itemable_type', 'itemable_id', 'quantity', 'unit_price', 'total_price'];

    protected $casts = [
        'unit_price' => 'float',
        'total_price' => 'float',
        'quantity' => 'integer',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function itemable(): MorphTo
    {
        return $this->morphTo();
    }
}
