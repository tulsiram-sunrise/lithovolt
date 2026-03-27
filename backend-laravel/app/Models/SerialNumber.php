<?php

namespace App\Models;

use App\Services\EntityAccessService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SerialNumber extends Model
{
    use HasFactory;

    protected $fillable = [
        'battery_model_id', 'product_id', 'serial_number', 'status', 
        'allocated_to', 'allocated_date', 'sold_date', 'sold_to'
    ];

    protected $casts = [
        'allocated_date' => 'datetime',
        'sold_date' => 'datetime',
    ];

    public function batteryModel(): BelongsTo
    {
        return $this->belongsTo(BatteryModel::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function allocatedToUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'allocated_to');
    }

    public function soldToUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sold_to');
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
