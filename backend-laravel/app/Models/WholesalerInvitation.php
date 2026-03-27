<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WholesalerInvitation extends Model
{
    protected $fillable = [
        'email',
        'name',
        'company_name',
        'invitation_token',
        'sent_at',
        'accepted_at',
        'expires_at',
        'invited_by_admin_id',
        'notes',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'accepted_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Get the admin who sent this invitation
     */
    public function invitedByAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by_admin_id');
    }

    /**
     * Check if invitation is still valid (not expired, not accepted)
     */
    public function isValid(): bool
    {
        if ($this->accepted_at) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Check if invitation has been sent
     */
    public function isSent(): bool
    {
        return $this->sent_at !== null;
    }
}
