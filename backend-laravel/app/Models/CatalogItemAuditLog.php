<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CatalogItemAuditLog extends Model
{
    public $timestamps = false;

    protected $table = 'catalog_item_audit_logs';

    protected $fillable = [
        'catalog_item_id',
        'user_id',
        'action',
        'changed_field',
        'old_value',
        'new_value',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function catalogItem(): BelongsTo
    {
        return $this->belongsTo(CatalogItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get human-readable action label
     */
    public function getActionLabelAttribute(): string
    {
        return match($this->action) {
            'CREATE' => 'Created',
            'UPDATE' => 'Updated',
            'DELETE' => 'Deleted',
            'PUBLISH' => 'Published',
            'DISCONTINUE' => 'Discontinued',
            default => 'Modified',
        };
    }

    /**
     * Static method to log a change
     */
    public static function logChange(
        CatalogItem $item,
        string $action,
        ?User $user = null,
        ?string $field = null,
        mixed $oldValue = null,
        mixed $newValue = null
    ): self {
        return static::create([
            'catalog_item_id' => $item->id,
            'user_id' => $user?->id,
            'action' => $action,
            'changed_field' => $field,
            'old_value' => is_string($oldValue) ? $oldValue : json_encode($oldValue),
            'new_value' => is_string($newValue) ? $newValue : json_encode($newValue),
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
            'created_at' => now(),
        ]);
    }
}
