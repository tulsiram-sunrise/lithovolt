<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class CatalogItem extends Model
{
    use SoftDeletes;

    protected $table = 'catalog_items';

    protected $fillable = [
        // Core identity
        'type', 'sku', 'name', 'slug',
        
        // Categorization
        'category_path',
        
        // Commercial
        'description', 'image_url',
        'price', 'cost_price', 'markup_percentage',
        
        // Inventory
        'total_quantity', 'available_quantity', 'reserved_quantity',
        'low_stock_threshold', 'reorder_quantity',
        
        // Capabilities
        'is_active', 'is_serialized', 'is_warranty_eligible',
        'is_fitment_eligible', 'is_returnable', 'allows_backorder',
        
        // Warranty
        'default_warranty_months', 'private_warranty_months',
        'commercial_warranty_months', 'warranty_coverage_type',
        
        // BATTERY specs
        'voltage_nominal', 'capacity_ah', 'capacity_wh',
        'chemistry', 'battery_type',
        'max_charge_current_a', 'max_discharge_current_a',
        'cca', 'reserve_capacity',
        'length_mm', 'width_mm', 'height_mm', 'total_height_mm',
        'unit_weight_kg',
        'terminal_type', 'terminal_layout', 'hold_down', 'vent_type',
        'group_size',
        'maintenance_free', 'charge_voltage_range', 'depth_of_discharge_percent',
        'cycle_life', 'bms_included',
        
        // ACCESSORY specs
        'compatible_types',
        
        // SERVICE specs
        'duration_days', 'hourly_rate', 'max_concurrent_sessions',
        
        // Brand & model
        'brand', 'series', 'model_code', 'model_year',
        
        // Documentation
        'datasheet_url', 'user_manual_url', 'support_contact',
        'application_segment',
        
        // Lifecycle
        'published_at', 'discontinued_at',
        
        // Extensibility
        'metadata',
        
        // Legacy bridge
        'legacy_battery_model_id', 'legacy_accessory_id', 'legacy_product_id',
    ];

    protected $casts = [
        'type' => 'string',
        'price' => 'float',
        'cost_price' => 'float',
        'markup_percentage' => 'float',
        'total_quantity' => 'integer',
        'available_quantity' => 'integer',
        'reserved_quantity' => 'integer',
        'is_active' => 'boolean',
        'is_serialized' => 'boolean',
        'is_warranty_eligible' => 'boolean',
        'is_fitment_eligible' => 'boolean',
        'is_returnable' => 'boolean',
        'allows_backorder' => 'boolean',
        'default_warranty_months' => 'integer',
        'private_warranty_months' => 'integer',
        'commercial_warranty_months' => 'integer',
        'voltage_nominal' => 'float',
        'capacity_ah' => 'float',
        'capacity_wh' => 'float',
        'max_charge_current_a' => 'float',
        'max_discharge_current_a' => 'float',
        'cca' => 'integer',
        'reserve_capacity' => 'integer',
        'length_mm' => 'float',
        'width_mm' => 'float',
        'height_mm' => 'float',
        'total_height_mm' => 'float',
        'unit_weight_kg' => 'float',
        'maintenance_free' => 'boolean',
        'depth_of_discharge_percent' => 'float',
        'cycle_life' => 'integer',
        'bms_included' => 'boolean',
        'compatible_types' => 'json',
        'duration_days' => 'integer',
        'hourly_rate' => 'float',
        'max_concurrent_sessions' => 'integer',
        'model_year' => 'integer',
        'metadata' => 'json',
        'published_at' => 'datetime',
        'discontinued_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // ========== Relationships ==========

    /**
     * Categories this item belongs to
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(
            CatalogCategory::class,
            'catalog_item_categories',
            'catalog_item_id',
            'catalog_category_id'
        )->withPivot('is_primary');
    }

    /**
     * Primary category (for sorting/display)
     */
    public function primaryCategory(): BelongsToMany
    {
        return $this->categories()->wherePivot('is_primary', true);
    }

    /**
     * Multi-variant support
     */
    public function variations(): HasMany
    {
        return $this->hasMany(CatalogVariation::class);
    }

    /**
     * Serial numbers (for BATTERY items)
     */
    public function serialNumbers(): HasMany
    {
        return $this->hasMany(SerialNumber::class);
    }

    /**
     * Warranties (for WARRANTY_ELIGIBLE items)
     */
    public function warranties(): HasMany
    {
        return $this->hasMany(Warranty::class);
    }

    /**
     * Order items referencing this catalog item
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Inventory locations (for multi-warehouse support)
     */
    public function locations(): HasMany
    {
        return $this->hasMany(CatalogItemLocation::class);
    }

    /**
     * Audit logs for this item
     */
    public function auditLogs(): HasMany
    {
        return $this->hasMany(CatalogItemAuditLog::class);
    }

    /**
     * Legacy battery model (backward compat)
     */
    public function legacyBatteryModel(): HasOne
    {
        return $this->hasOne(BatteryModel::class, 'id', 'legacy_battery_model_id');
    }

    /**
     * Legacy accessory (backward compat)
     */
    public function legacyAccessory(): HasOne
    {
        return $this->hasOne(Accessory::class, 'id', 'legacy_accessory_id');
    }

    /**
     * Legacy product (backward compat)
     */
    public function legacyProduct(): HasOne
    {
        return $this->hasOne(Product::class, 'id', 'legacy_product_id');
    }

    // ========== Scopes ==========

    /**
     * Scope: Only active items
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)->whereNull('discontinued_at');
    }

    /**
     * Scope: Only published items
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    /**
     * Scope: Filter by type
     */
    public function scopeOfType(Builder $query, string $type): Builder
    {
        return $query->where('type', strtoupper($type));
    }

    /**
     * Scope: Filter multiple types
     */
    public function scopeOfTypes(Builder $query, array $types): Builder
    {
        $uppercased = array_map('strtoupper', $types);
        return $query->whereIn('type', $uppercased);
    }

    /**
     * Scope: Filter by category
     */
    public function scopeInCategory(Builder $query, string $categoryName): Builder
    {
        return $query->whereHas('categories', function (Builder $q) use ($categoryName) {
            $q->where('name', $categoryName);
        });
    }

    /**
     * Scope: Only items with available stock
     */
    public function scopeInStock(Builder $query): Builder
    {
        return $query->where('available_quantity', '>', 0);
    }

    /**
     * Scope: Only low-stock items
     */
    public function scopeLowStock(Builder $query): Builder
    {
        return $query->whereRaw('available_quantity <= low_stock_threshold');
    }

    /**
     * Scope: Apply user visibility (respects role-based access)
     */
    public function scopeVisibleToUser(Builder $query, User $user): Builder
    {
        // Reuse EntityAccessService for permission consistency
        $accessService = new \App\Services\EntityAccessService();
        return $accessService->applyVisibility($user, 'INVENTORY', $query);
    }

    /**
     * Scope: Search by name, sku, brand, model
     */
    public function scopeSearch(Builder $query, string $term): Builder
    {
        return $query->where(function (Builder $q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
                ->orWhere('sku', 'like', "%{$term}%")
                ->orWhere('brand', 'like', "%{$term}%")
                ->orWhere('model_code', 'like', "%{$term}%")
                ->orWhere('description', 'like', "%{$term}%");
        });
    }

    /**
     * Scope: Filter by category path (denormalized hierarchical path)
     */
    public function scopeByCategory(Builder $query, string $path): Builder
    {
        return $query->where('category_path', 'like', "{$path}%");
    }

    // ========== Accessors & Mutators ==========

    /**
     * Generate slug from name
     */
    public function setNameAttribute($value)
    {
        $this->attributes['name'] = $value;
        if (!isset($this->attributes['slug']) || $this->attributes['slug'] === null) {
            $this->attributes['slug'] = \Illuminate\Support\Str::slug($value);
        }
    }

    /**
     * Get display name with variant info if applicable
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->name;
    }

    /**
     * Get unit cost (for margin calculations)
     */
    public function getUnitCostAttribute(): float
    {
        return $this->cost_price ?? 0;
    }

    /**
     * Get profit margin (price - cost)
     */
    public function getProfitMarginAttribute(): float
    {
        return max(0, $this->price - $this->unit_cost);
    }

    /**
     * Get margin percentage (manual or calculated)
     */
    public function getMarginPercentageAttribute(): float
    {
        if ($this->attributes['markup_percentage'] !== null) {
            return $this->attributes['markup_percentage'];
        }
        
        if ($this->unit_cost <= 0) {
            return 0;
        }
        
        return round((($this->profit_margin / $this->unit_cost) * 100), 2);
    }

    /**
     * Get stock status label
     */
    public function getStockStatusAttribute(): string
    {
        if ($this->available_quantity <= 0) {
            return 'OUT_OF_STOCK';
        }
        if ($this->available_quantity <= $this->low_stock_threshold) {
            return 'LOW_STOCK';
        }
        return 'IN_STOCK';
    }

    /**
     * Get warranty label
     */
    public function getWarrantyLabelAttribute(): string
    {
        if (!$this->is_warranty_eligible) {
            return 'No Warranty';
        }
        
        $months = $this->default_warranty_months ?? $this->private_warranty_months ?? 0;
        if ($months == 0) {
            return 'No Warranty';
        }
        
        $years = intval($months / 12);
        $remainingMonths = $months % 12;
        
        if ($years > 0 && $remainingMonths === 0) {
            return "{$years} Year" . ($years > 1 ? 's' : '');
        }
        
        return "{$months} Months";
    }

    /**
     * Get capability summary for API responses
     */
    public function getCapabilitiesAttribute(): array
    {
        return [
            'serialized' => $this->is_serialized,
            'warranty_eligible' => $this->is_warranty_eligible,
            'fitment_eligible' => $this->is_fitment_eligible,
            'returnable' => $this->is_returnable,
            'backorder_allowed' => $this->allows_backorder,
        ];
    }

    // ========== Type-Specific Methods ==========

    /**
     * Check if this is a battery item
     */
    public function isBattery(): bool
    {
        return $this->type === 'BATTERY';
    }

    /**
     * Check if this is an accessory item
     */
    public function isAccessory(): bool
    {
        return $this->type === 'ACCESSORY';
    }

    /**
     * Check if this is a service item
     */
    public function isService(): bool
    {
        return $this->type === 'SERVICE';
    }

    /**
     * Get type label (human-readable)
     */
    public function getTypeLabel(): string
    {
        return match($this->type) {
            'BATTERY' => 'Battery',
            'ACCESSORY' => 'Accessory',
            'PART' => 'Part',
            'CONSUMABLE' => 'Consumable',
            'SERVICE' => 'Service',
            default => 'Product',
        };
    }

    // ========== Business Logic Methods ==========

    /**
     * Reserve quantity for an order
     */
    public function reserve(int $quantity): bool
    {
        if ($this->available_quantity < $quantity) {
            return false;
        }

        $this->available_quantity -= $quantity;
        $this->reserved_quantity += $quantity;
        return $this->save();
    }

    /**
     * Release reserved quantity (order cancelled)
     */
    public function releaseReservation(int $quantity): bool
    {
        if ($this->reserved_quantity < $quantity) {
            return false;
        }

        $this->reserved_quantity -= $quantity;
        $this->available_quantity += $quantity;
        return $this->save();
    }

    /**
     * Fulfill reserved quantity (order completed)
     */
    public function fulfillReservation(int $quantity): bool
    {
        if ($this->reserved_quantity < $quantity) {
            return false;
        }

        $this->reserved_quantity -= $quantity;
        $this->total_quantity -= $quantity;
        return $this->save();
    }

    /**
     * Check if item is discontinued
     */
    public function isDiscontinued(): bool
    {
        return $this->discontinued_at !== null && $this->discontinued_at <= now();
    }

    /**
     * Discontinue this item
     */
    public function discontinue(): bool
    {
        $this->discontinued_at = now();
        $this->is_active = false;
        return $this->save();
    }

    /**
     * Reactivate this item
     */
    public function reactivate(): bool
    {
        $this->discontinued_at = null;
        $this->is_active = true;
        return $this->save();
    }

    /**
     * Publish this item (make visible)
     */
    public function publish(): bool
    {
        $this->published_at = now();
        $this->is_active = true;
        return $this->save();
    }

    /**
     * Get reorder status
     */
    public function needsReorder(): bool
    {
        return $this->available_quantity <= $this->low_stock_threshold;
    }

    /**
     * Calculate total value in inventory
     */
    public function getInventoryValueAttribute(): float
    {
        return $this->total_quantity * $this->price;
    }

    /**
     * Get applicable warranty months based on customer type
     */
    public function getWarrantyMonthsFor(string $customerType = 'private'): int
    {
        if (!$this->is_warranty_eligible) {
            return 0;
        }

        return match($customerType) {
            'commercial' => $this->commercial_warranty_months ?? $this->default_warranty_months ?? 0,
            'private' => $this->private_warranty_months ?? $this->default_warranty_months ?? 0,
            default => $this->default_warranty_months ?? 0,
        };
    }
}
