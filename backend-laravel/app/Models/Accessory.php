<?php

namespace App\Models;

use App\Services\EntityAccessService;
use Illuminate\Database\Eloquent\Builder;
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

    /**
     * Scope to apply entity visibility based on user's permissions.
     *
     * @param Builder $query
     * @param User $user
     * @return Builder
     */
    public function scopeVisibleToUser(Builder $query, User $user): Builder
    {
        $accessService = new EntityAccessService();
        return $accessService->applyVisibility($user, 'INVENTORY', $query);
    }
}
