<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'product_type', 'sku', 'category_id', 'legacy_battery_model_id', 'legacy_accessory_id',
        'description', 'price',
        'total_quantity', 'available_quantity', 'low_stock_threshold',
        'metadata', 'is_active', 'is_serialized', 'is_warranty_eligible', 'is_fitment_eligible',
        'default_warranty_months'
    ];

    protected $casts = [
        'product_type' => 'string',
        'price' => 'float',
        'total_quantity' => 'integer',
        'available_quantity' => 'integer',
        'low_stock_threshold' => 'integer',
        'metadata' => 'array',
        'is_active' => 'boolean',
        'is_serialized' => 'boolean',
        'is_warranty_eligible' => 'boolean',
        'is_fitment_eligible' => 'boolean',
        'default_warranty_months' => 'integer',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class);
    }

    public function orderItems(): MorphMany
    {
        return $this->morphMany(OrderItem::class, 'itemable');
    }

    public function legacyBatteryModel(): HasOne
    {
        return $this->hasOne(BatteryModel::class, 'id', 'legacy_battery_model_id');
    }

    public function legacyAccessory(): HasOne
    {
        return $this->hasOne(Accessory::class, 'id', 'legacy_accessory_id');
    }

    public function serialNumbers(): HasMany
    {
        return $this->hasMany(SerialNumber::class);
    }

    public function warranties(): HasMany
    {
        return $this->hasMany(Warranty::class);
    }
}
