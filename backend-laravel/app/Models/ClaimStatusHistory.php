<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClaimStatusHistory extends Model
{
    use HasFactory;

    protected $table = 'claim_status_history';

    protected $fillable = [
        'claim_id',
        'from_status',
        'to_status',
        'changed_by',
        'notes',
    ];

    public function claim(): BelongsTo
    {
        return $this->belongsTo(WarrantyClaim::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
