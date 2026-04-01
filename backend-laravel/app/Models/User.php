<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $appends = [
        'full_name',
    ];

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'phone',
        'address',
        'city',
        'state',
        'postal_code',
        'role_id',
        'role',
        'is_verified',
        'is_active',
        'verification_code',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'verification_code',
        'role_id',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_verified' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    public function getFullNameAttribute(): string
    {
        return trim(($this->first_name ?? '') . ' ' . ($this->last_name ?? ''));
    }

    /**
     * Get the user's role as a string instead of role_id
     */
    public function getRoleAttribute()
    {
        return $this->resolveRoleName();
    }

    /**
     * Resolve role name using role_id mapping first, then legacy role text fallback.
     */
    public function resolveRoleName(string $default = 'customer'): string
    {
        if ($this->role_id) {
            if ($this->relationLoaded('modelRole')) {
                $name = $this->getRelation('modelRole')?->name;
                return $name ?: $default;
            }

            if ($this->relationLoaded('role')) {
                $name = $this->getRelation('role')?->name;
                return $name ?: $default;
            }

            $name = $this->modelRole()->value('name');
            return is_string($name) && $name !== '' ? $name : $default;
        }

        $legacyRole = $this->attributes['role'] ?? null;
        if (is_string($legacyRole) && $legacyRole !== '') {
            return $legacyRole;
        }

        return $default;
    }

    public function hasRole(string $role): bool
    {
        return strtoupper($this->resolveRoleName()) === strtoupper(trim($role));
    }

    public function modelRole(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    /**
     * Alias for modelRole relationship for convenience
     */
    public function role(): BelongsTo
    {
        return $this->modelRole();
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

    public function wholesalerApplication(): HasOne
    {
        return $this->hasOne(WholesalerApplication::class);
    }

    public function staffUser(): HasOne
    {
        return $this->hasOne(StaffUser::class);
    }
}
