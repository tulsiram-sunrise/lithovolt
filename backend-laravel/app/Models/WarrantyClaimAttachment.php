<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WarrantyClaimAttachment extends Model
{
    use HasFactory;

    protected $fillable = ['warranty_claim_id', 'file_path', 'file_type', 'file_name'];

    public function claim(): BelongsTo
    {
        return $this->belongsTo(WarrantyClaim::class, 'warranty_claim_id');
    }
}
