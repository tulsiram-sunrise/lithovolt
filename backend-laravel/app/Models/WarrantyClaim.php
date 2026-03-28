<?php

namespace App\Models;

use App\Services\EntityAccessService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WarrantyClaim extends Model
{
    use HasFactory;

    protected $fillable = [
        'warranty_id', 'user_id', 'claim_number', 'complaint_description',
        'status', 'resolution', 'resolved_date', 'assigned_to', 'reviewed_by',
        'review_notes'
    ];

    protected $casts = [
        'resolved_date' => 'datetime',
    ];

    public const STATUS_PENDING = 'PENDING';
    public const STATUS_UNDER_REVIEW = 'UNDER_REVIEW';
    public const STATUS_APPROVED = 'APPROVED';
    public const STATUS_REJECTED = 'REJECTED';
    public const STATUS_RESOLVED = 'RESOLVED';

    public static function validStatuses(): array
    {
        return [
            self::STATUS_PENDING,
            self::STATUS_UNDER_REVIEW,
            self::STATUS_APPROVED,
            self::STATUS_REJECTED,
            self::STATUS_RESOLVED,
        ];
    }

    public function warranty(): BelongsTo
    {
        return $this->belongsTo(Warranty::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(WarrantyClaimAttachment::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(ClaimStatusHistory::class)->orderByDesc('created_at');
    }

    /**
     * Check if transition to new status is valid
     */
    public function canTransitionTo(string $newStatus): bool
    {
        $currentStatus = strtoupper((string) $this->status);
        $newStatus = strtoupper((string) $newStatus);

        $validTransitions = [
            self::STATUS_PENDING => [self::STATUS_UNDER_REVIEW],
            self::STATUS_UNDER_REVIEW => [self::STATUS_APPROVED, self::STATUS_REJECTED],
            self::STATUS_APPROVED => [self::STATUS_RESOLVED],
            self::STATUS_REJECTED => [self::STATUS_RESOLVED],
            self::STATUS_RESOLVED => [],
        ];

        return in_array($newStatus, $validTransitions[$currentStatus] ?? [], true);
    }

    /**
     * Update claim status with validation
     */
    public function updateStatus(string $newStatus, ?User $reviewedBy = null, string $reviewNotes = ''): void
    {
        $fromStatus = strtoupper((string) $this->status);
        $newStatus = strtoupper((string) $newStatus);

        if (!$this->canTransitionTo($newStatus)) {
            throw new \Exception("Cannot transition from {$fromStatus} to {$newStatus}");
        }

        $this->status = $newStatus;
        if ($reviewedBy) {
            $this->reviewed_by = $reviewedBy->id;
        }
        if ($reviewNotes) {
            $this->review_notes = $reviewNotes;
        }
        if (in_array($newStatus, [self::STATUS_APPROVED, self::STATUS_REJECTED, self::STATUS_RESOLVED])) {
            $this->resolved_date = now();
        }

        $this->save();

        // Record status history
        ClaimStatusHistory::create([
            'claim_id' => $this->id,
            'from_status' => $fromStatus,
            'to_status' => $newStatus,
            'changed_by' => $reviewedBy?->id,
            'notes' => $reviewNotes,
        ]);
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
        return $accessService->applyVisibility($user, 'WARRANTY_CLAIMS', $query);
    }
}
