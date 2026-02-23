<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // Always return null - we'll handle unauthenticated responses properly
        return null;
    }

    /**
     * Handle an unauthenticated user.
     */
    protected function unauthenticated($request, array $guards)
    {
        // For API requests, throw AuthenticationException which returns JSON 401
        if ($request->expectsJson() || str_starts_with($request->path(), 'api')) {
            throw new \Illuminate\Auth\AuthenticationException(
                'Unauthenticated.',
                $guards
            );
        }

        // For web requests, use parent behavior
        parent::unauthenticated($request, $guards);
    }
}

