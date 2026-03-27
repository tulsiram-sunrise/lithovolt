<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class HandleEntityAccessDenial
{
    /**
     * Handle an incoming request to check for entity visibility denials.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // If authenticated user receives empty results when fetching entities,
        // check if they have permission to view that resource
        if ($request->getMethod() === 'GET' && $response->status() === 200) {
            // This middleware can be extended to provide better feedback
            // For now, we let empty results pass through - users with no access
            // will see empty lists rather than 403 errors
        }

        return $response;
    }
}
