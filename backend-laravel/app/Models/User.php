<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'name',
        'email',
        'password',
        'phone',
        'company_name',
        'company_registration',
        'role_id',
        'role',
        'is_verified',
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

    /**
     * Get the user's first name and last name from 'name' field if they don't exist
     */
    public function getFirstNameAttribute()
    {
        if ($this->attributes['first_name'] ?? null) {
            return $this->attributes['first_name'];
        }

        // Extract first_name from name field if it exists
        if (isset($this->attributes['name'])) {
            $parts = explode(' ', $this->attributes['name']);
            return $parts[0] ?? $this->attributes['name'];
        }

        return null;
    }

    public function getLastNameAttribute()
    {
        if ($this->attributes['last_name'] ?? null) {
            return $this->attributes['last_name'];
        }

        // Extract last_name from name field if it exists
        if (isset($this->attributes['name'])) {
            $parts = explode(' ', $this->attributes['name']);
            return $parts[1] ?? '';
        }

        return null;
    }

    /**
     * Get the user's role as a string instead of role_id
     */
    public function getRoleAttribute()
    {
        // Check if role field exists directly in attributes
        if ($this->attributes['role'] ?? null) {
            return $this->attributes['role'];
        }

        // Otherwise, get from role relationship
        if ($this->role_id) {
            // If relation is loaded, use it
            if ($this->relationLoaded('role')) {
                return $this->role?->name ?? 'customer';
            }
            // Otherwise, query it
            return Role::find($this->role_id)?->name ?? 'customer';
        }

        return 'customer';
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
}
