<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationSetting extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'email_notifications', 'sms_notifications', 'push_notifications'];

    protected $casts = [
        'email_notifications' => 'boolean',
        'sms_notifications' => 'boolean',
        'push_notifications' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
