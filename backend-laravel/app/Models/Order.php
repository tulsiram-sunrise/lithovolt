<?php

namespace App\Models;

use App\Services\EntityAccessService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['order_number', 'user_id', 'total_amount', 'status', 'payment_status', 'notes'];

    protected $casts = [
        'total_amount' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
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
        return $accessService->applyVisibility($user, 'ORDERS', $query);
    }
}
