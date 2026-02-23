<?php
/**
 * CORS Debugger - See exactly what's happening
 * Auto-detects Laravel root directory
 * 
 * Place at: backend-laravel/public/cors-debug.php
 * Access: https://api.lithovolt.com.au/cors-debug.php
 */

header('Content-Type: application/json');

// Prevent error display that breaks JSON
ini_set('display_errors', 0);
error_reporting(E_ALL);

set_error_handler(function($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    die(json_encode([
        'status' => 'error',
        'message' => $errstr,
        'file' => basename($errfile),
        'line' => $errline
    ]));
});

set_exception_handler(function($exception) {
    http_response_code(500);
    die(json_encode([
        'status' => 'error',
        'message' => $exception->getMessage(),
        'file' => basename($exception->getFile()),
        'line' => $exception->getLine()
    ]));
});

// Find Laravel root - check known path first, then auto-detect
function findLaravelRoot($startPath) {
    // First try the known path: ../../lithovolt-api
    $knownPath = realpath($startPath . '/../../lithovolt-api');
    if ($knownPath && file_exists($knownPath . '/artisan') && 
        file_exists($knownPath . '/composer.json') && 
        file_exists($knownPath . '/app')) {
        return $knownPath;
    }
    
    // Fallback to auto-detection
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
        
        // Parse the config file without executing it (avoids env() error)
        $corsFileContent = file_get_contents($corsConfigPath);
        
        // Extract allowed_origins using regex
        $allowedOrigins = [];
        if (preg_match("/'allowed_origins'\s*=>\s*\[(.*?)\]/s", $corsFileContent, $matches)) {
            // Extract all quoted URLs (single or double quotes)
            preg_match_all("/['\"]([^'\"]*)['\"]/" , $matches[1], $origins);
            $allowedOrigins = $origins[1] ?? [];
        }
        
        $debug['cors_config_file']['allowed_origins'] = $allowedOrigins;
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
