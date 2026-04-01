<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CatalogVariation extends Model
{
    protected $table = 'catalog_variations';

    protected $fillable = [
        'catalog_item_id',
        'sku_suffix',
        'name_suffix',
        'price',
        'image_url',
        'capacity_ah',
        'capacity_wh',
        'total_quantity',
        'available_quantity',
        'is_active',
    ];

    protected $casts = [
        'price' => 'float',
        'capacity_ah' => 'float',
        'capacity_wh' => 'float',
        'total_quantity' => 'integer',
        'available_quantity' => 'integer',
        'is_active' => 'boolean',
    ];

    // ========== Relationships ==========

    /**
     * Parent catalog item
     */
    public function catalogItem(): BelongsTo
    {
        return $this->belongsTo(CatalogItem::class);
    }

    /**
     * Orders using this specific variation
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    // ========== Accessors ==========

    /**
     * Get full SKU (parent + suffix)
     */
    public function getFullSkuAttribute(): string
    {
        return $this->catalogItem->sku . ($this->sku_suffix ? $this->sku_suffix : '');
    }

    /**
     * Get display name (parent + suffix)
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->catalogItem->name . ($this->name_suffix ? " ({$this->name_suffix})" : '');
    }

    /**
     * Get effective price (variation or parent)
     */
    public function getEffectivePriceAttribute(): float
    {
        return $this->price ?? $this->catalogItem->price;
    }

    /**
     * Get effective image (variation or parent)
     */
    public function getEffectiveImageAttribute(): ?string
    {
        return $this->image_url ?? $this->catalogItem->image_url;
    }

    /**
     * Check if variant is in stock
     */
    public function isInStock(): bool
    {
        return $this->available_quantity > 0;
    }
}
