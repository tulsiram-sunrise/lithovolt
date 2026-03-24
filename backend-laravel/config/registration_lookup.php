<?php

return [
    'provider_enabled' => env('REGISTRATION_PROVIDER_ENABLED', false),
    'provider_driver' => env('REGISTRATION_PROVIDER_DRIVER', 'null'),
    'provider_name' => env('REGISTRATION_PROVIDER_NAME', 'none'),
    'cache_ttl_minutes' => (int) env('REGISTRATION_LOOKUP_CACHE_TTL', 1440),
    'http' => [
        'url' => env('REGISTRATION_PROVIDER_HTTP_URL', ''),
        'method' => env('REGISTRATION_PROVIDER_HTTP_METHOD', 'GET'),
        'token' => env('REGISTRATION_PROVIDER_HTTP_TOKEN', ''),
        'token_header' => env('REGISTRATION_PROVIDER_HTTP_TOKEN_HEADER', 'Authorization'),
        'token_prefix' => env('REGISTRATION_PROVIDER_HTTP_TOKEN_PREFIX', 'Bearer'),
        'vehicle_path' => env('REGISTRATION_PROVIDER_HTTP_VEHICLE_PATH', 'vehicle'),
        'rego_param' => env('REGISTRATION_PROVIDER_HTTP_REGO_PARAM', 'registration_number'),
        'state_param' => env('REGISTRATION_PROVIDER_HTTP_STATE_PARAM', 'state_code'),
        'market_param' => env('REGISTRATION_PROVIDER_HTTP_MARKET_PARAM', 'market'),
        'timeout_seconds' => (int) env('REGISTRATION_PROVIDER_HTTP_TIMEOUT', 10),
    ],
];
