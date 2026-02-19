<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WarrantyClaim extends Model
{
    use HasFactory;

    protected $fillable = [
        'warranty_id', 'user_id', 'claim_number', 'complaint_description',
        'status', 'resolution', 'resolved_date'
    ];

    protected $casts = [
        'resolved_date' => 'datetime',
    ];

    public function warranty(): BelongsTo
    {
        return $this->belongsTo(Warranty::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(WarrantyClaimAttachment::class);
    }
}
