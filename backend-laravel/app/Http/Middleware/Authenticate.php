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
        // Always return null for API requests to trigger 401 Unauthorized response
        // For web requests, return the login route (if it exists)
        if ($request->expectsJson()) {
            return null;
        }
        
        try {
            return route('login');
        } catch (\Exception $e) {
            // If 'login' route doesn't exist, return null
            return null;
        }
    }
}
