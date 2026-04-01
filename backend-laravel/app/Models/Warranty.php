<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Warranty extends Model
{
    use HasFactory;

    protected $fillable = [
        'warranty_number', 'battery_model_id', 'product_id', 'user_id', 'serial_number',
        'issue_date', 'expiry_date', 'status', 'qr_code'
    ];

    protected $casts = [
        'issue_date' => 'date',
        'expiry_date' => 'date',
    ];

    public function batteryModel(): BelongsTo
    {
        return $this->belongsTo(BatteryModel::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function claims(): HasMany
    {
        return $this->hasMany(WarrantyClaim::class);
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
        $roleName = strtoupper((string) ($user?->role?->name ?? $user?->role ?? ''));

        if ($roleName === 'ADMIN') {
            return $query;
        }

        // Non-admin users should only see warranties owned by their account.
        return $query->where('user_id', $user->id);
    }
}
