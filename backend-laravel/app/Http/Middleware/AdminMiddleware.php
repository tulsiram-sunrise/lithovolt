<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        $roleName = strtoupper((string) ($user?->role?->name ?? $user?->role ?? ''));

        if (!$user || $roleName !== 'ADMIN') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $next($request);
    }
}
