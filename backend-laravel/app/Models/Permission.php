<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Permission extends Model
{
    use HasFactory;

    protected $fillable = [
        'role_id',
        'resource',
        'action',
        'description',
    ];

    /**
     * Get the role this permission belongs to
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }
}
