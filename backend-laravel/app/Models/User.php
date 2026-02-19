<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'company_name',
        'company_registration',
        'role_id',
        'is_verified',
        'verification_code',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'verification_code',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_verified' => 'boolean',
    ];

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function warranties(): HasMany
    {
        return $this->hasMany(Warranty::class);
    }

    public function warrantyClaims(): HasMany
    {
        return $this->hasMany(WarrantyClaim::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function notificationSettings(): HasMany
    {
        return $this->hasMany(NotificationSetting::class);
    }
}
