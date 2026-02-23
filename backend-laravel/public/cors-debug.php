<?php
/**
 * CORS Debugger - See exactly what's happening
 * Auto-detects Laravel root directory
 * 
 * Place at: backend-laravel/public/cors-debug.php
 * Access: https://api.lithovolt.com.au/cors-debug.php
 */

header('Content-Type: application/json');

// Auto-detect Laravel root
function findLaravelRoot($startPath) {
    $currentPath = $startPath;
    $maxLevels = 5;
    $level = 0;
    
    while ($level < $maxLevels) {
        if (file_exists($currentPath . '/artisan') && 
            file_exists($currentPath . '/composer.json') && 
            file_exists($currentPath . '/app')) {
            return $currentPath;
        }
        $currentPath = dirname($currentPath);
        $level++;
    }
    return false;
}

$laravelRoot = findLaravelRoot(__DIR__);

$debug = [
    'timestamp' => date('Y-m-d H:i:s'),
    'script_location' => __FILE__,
    'detected_laravel_root' => $laravelRoot,
    'request' => [
        'method' => $_SERVER['REQUEST_METHOD'],
        'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'NOT SENT',
        'host' => $_SERVER['HTTP_HOST'] ?? 'unknown',
        'url' => $_SERVER['REQUEST_URI'] ?? 'unknown',
    ],
    'laravel_env' => [
        'app_env' => getenv('APP_ENV'),
        'app_url' => getenv('APP_URL'),
        'cors_max_age' => getenv('CORS_MAX_AGE'),
    ],
    'cors_config_file' => [
        'exists' => false,
        'allowed_origins' => [],
        'path' => ''
    ],
    'response_headers_that_will_be_sent' => [
        'Access-Control-Allow-Origin' => 'Will be set by middleware',
        'Access-Control-Allow-Methods' => 'Will be set by middleware',
        'Access-Control-Allow-Headers' => 'Will be set by middleware',
    ],
    'checks' => [],
    'solution' => ''
];

// Check if CORS config file exists
if ($laravelRoot) {
    $corsConfigPath = $laravelRoot . '/config/cors.php';
    if (file_exists($corsConfigPath)) {
        $debug['cors_config_file']['exists'] = true;
        $debug['cors_config_file']['path'] = $corsConfigPath;
        
        // Parse the config file
        $corsConfig = require $corsConfigPath;
        $debug['cors_config_file']['allowed_origins'] = $corsConfig['allowed_origins'] ?? [];
        $debug['cors_config_file']['supports_credentials'] = $corsConfig['supports_credentials'] ?? false;
    }
}

// Check if origin is in allowed list
$origin = $_SERVER['HTTP_ORIGIN'] ?? null;
$allowedOrigins = $debug['cors_config_file']['allowed_origins'];

if ($origin) {
    $isAllowed = in_array($origin, $allowedOrigins);
    $debug['checks']['origin_check'] = [
        'origin_sent' => $origin,
        'is_in_allowed_list' => $isAllowed,
        'allowed_origins_list' => $allowedOrigins,
    ];
    
    if (!$isAllowed) {
        $debug['solution'] = "❌ Your origin '$origin' is NOT in the allowed_origins list in config/cors.php\n\nFIX: Add '$origin' to allowed_origins in config/cors.php";
    } else {
        $debug['solution'] = "✅ Origin is allowed! CORS should work.";
    }
} else {
    $debug['checks']['origin_check'] = [
        'origin_sent' => 'NONE',
        'is_in_allowed_list' => 'N/A',
        'explanation' => 'No Origin header sent. This is the request that hits the server.',
    ];
}

// Check environment
$debug['checks']['environment'] = [
    'app_env_is_production' => getenv('APP_ENV') === 'production',
    'app_debug_is_false' => getenv('APP_DEBUG') === 'false',
    'env_file_exists' => file_exists(dirname(__DIR__) . '/.env'),
];

// Check middleware
$debug['checks']['middleware'] = [
    'cors_middleware_exists' => file_exists(dirname(__DIR__) . '/app/Http/Middleware/HandleCors.php'),
    'middleware_enabled_in_kernel' => 'Check app/Http/Kernel.php for HandleCors',
];

echo json_encode($debug, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>
