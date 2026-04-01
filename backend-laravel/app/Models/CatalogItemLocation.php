<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CatalogItemLocation extends Model
{
    protected $table = 'catalog_item_locations';

    protected $fillable = [
        'catalog_item_id',
        'location_code',
        'quantity_available',
        'quantity_reserved',
    ];

    protected $casts = [
        'quantity_available' => 'integer',
        'quantity_reserved' => 'integer',
    ];

    public function catalogItem(): BelongsTo
    {
        return $this->belongsTo(CatalogItem::class);
    }

    /**
     * Get total quantity at this location
     */
    public function getTotalQuantityAttribute(): int
    {
        return $this->quantity_available + $this->quantity_reserved;
    }

    /**
     * Check if location has stock
     */
    public function hasStock(): bool
    {
        return $this->quantity_available > 0;
    }
}
