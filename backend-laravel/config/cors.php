<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    /*
    |--------------------------------------------------------------------------
    | Methods: GET, HEAD, PUT, PATCH, POST, DELETE
    |--------------------------------------------------------------------------
    */
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],

    /*
    |--------------------------------------------------------------------------
    | Allowed Origins - Configure for your environment
    |--------------------------------------------------------------------------
    | Development: Add localhost:3000 and localhost:5173
    | Production: Add https://lithovolt.com.au and https://www.lithovolt.com.au
    */
    'allowed_origins' => [
        // Development
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        
        // Production
        'https://lithovolt.com.au',
        'https://www.lithovolt.com.au',
        
        // Staging (if applicable)
        'https://staging.lithovolt.com.au',
    ],

    'allowed_origins_patterns' => [],

    /*
    |--------------------------------------------------------------------------
    | Allowed Headers
    |--------------------------------------------------------------------------
    | Headers that are safe to accept from cross-origin requests
    */
    'allowed_headers' => [
        'Content-Type',
        'Authorization',
        'Accept',
        'Origin',
        'X-Requested-With',
        'X-CSRF-Token',
    ],

    /*
    |--------------------------------------------------------------------------
    | Exposed Headers
    |--------------------------------------------------------------------------
    | Headers that can be exposed to the browser
    */
    'exposed_headers' => [
        'Content-Type',
        'Authorization',
    ],

    /*
    |--------------------------------------------------------------------------
    | Max Age
    |--------------------------------------------------------------------------
    | How long the browser can cache the preflight response (in seconds)
    | Set to 0 for development, higher values for production (e.g., 86400 = 24 hours)
    */
    'max_age' => env('CORS_MAX_AGE', 0),

    /*
    |--------------------------------------------------------------------------
    | Credentials Support
    |--------------------------------------------------------------------------
    | Enable for JWT/Cookie-based authentication
    */
    'supports_credentials' => true,

];
