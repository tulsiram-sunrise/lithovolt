<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class CatalogCategory extends Model
{
    protected $table = 'catalog_categories';

    protected $fillable = [
        'name', 'slug', 'description', 'parent_id',
        'level', 'path', 'is_active', 'display_order', 'icon_url', 'color_hex'
    ];

    protected $casts = [
        'level' => 'integer',
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    // ========== Relationships ==========

    /**
     * Parent category (for hierarchical structure)
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(CatalogCategory::class, 'parent_id');
    }

    /**
     * Child categories
     */
    public function children(): HasMany
    {
        return $this->hasMany(CatalogCategory::class, 'parent_id');
    }

    /**
     * All items in this category
     */
    public function items(): BelongsToMany
    {
        return $this->belongsToMany(
            CatalogItem::class,
            'catalog_item_categories',
            'catalog_category_id',
            'catalog_item_id'
        )->withPivot('is_primary');
    }

    // ========== Scopes ==========

    /**
     * Only active categories
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Root categories only (parent_id is null)
     */
    public function scopeRoots(Builder $query): Builder
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Get full hierarchical path
     */
    public function getHierarchyPath(): string
    {
        if ($this->parent_id === null) {
            return $this->name;
        }

        $parent = $this->parent;
        return $parent->getHierarchyPath() . ' > ' . $this->name;
    }
}
