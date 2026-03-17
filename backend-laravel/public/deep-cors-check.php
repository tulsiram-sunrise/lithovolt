<?php
/**
 * Deep CORS Middleware Inspection
 * Checks if HandleCors is properly loaded and in the right place
 */

header('Content-Type: application/json');

$laravelRoot = realpath(__DIR__ . '/../../lithovolt-api');

if (!$laravelRoot || !file_exists($laravelRoot . '/artisan')) {
    die(json_encode(['error' => 'Laravel not found']));
}

$result = [
    'timestamp' => date('Y-m-d H:i:s'),
    'kernel_file' => $laravelRoot . '/app/Http/Kernel.php',
];

// Read Kernel.php
$kernelContent = file_get_contents($laravelRoot . '/app/Http/Kernel.php');

// Extract the entire $middleware array
preg_match('/protected\s+\$middleware\s*=\s*\[(.*?)\];/s', $kernelContent, $matches);
$middlewareArray = $matches[1] ?? '';

$result['global_middleware_section'] = $middlewareArray;

// Check if HandleCors is in there
$hasCors = strpos($middlewareArray, 'HandleCors') !== false;
$result['has_handlecors'] = $hasCors;

if ($hasCors) {
    // Extract the exact line
    preg_match_all('/.*HandleCors.*/', $middlewareArray, $corsLines);
    $result['cors_middleware_line'] = $corsLines[0][0] ?? 'Found but unclear';
} else {
    $result['cors_middleware_line'] = 'NOT FOUND - This is the problem!';
}

// Check routes
$result['route_files'] = [];
$routesPath = $laravelRoot . '/routes';
if (is_dir($routesPath)) {
    $routes = scandir($routesPath);
    foreach ($routes as $route) {
        if (strpos($route, '.php') !== false) {
            $result['route_files'][] = $route;
            
            // Check if routes have middleware
            $routeContent = file_get_contents($routesPath . '/' . $route);
            if (strpos($routeContent, 'middleware') !== false) {
                preg_match_all("/middleware\(['\"]([^'\"]*)['\"].*?\)/", $routeContent, $mw);
                if (!empty($mw[1])) {
                    $result['route_' . $route . '_middleware'] = $mw[1];
                }
            }
        }
    }
}

// Check if bootstrap cache was recreated
$bootstrapCache = $laravelRoot . '/bootstrap/cache';
if (is_dir($bootstrapCache)) {
    $cacheFiles = array_diff(scandir($bootstrapCache), ['.', '..']);
    $result['bootstrap_cache_files'] = array_values($cacheFiles);
    
    if (file_exists($bootstrapCache . '/config.php')) {
        $result['warning'] = 'Config cache recreated - may contain old CORS settings';
    }
}

// Check CORS config
$corsConfigPath = $laravelRoot . '/config/cors.php';
$corsFileContent = file_get_contents($corsConfigPath);

// Check if config has a paths key that might be limiting routes
if (preg_match("/'paths'\s*=>\s*\[(.*?)\]/s", $corsFileContent, $matches)) {
    preg_match_all("/['\"]([^'\"]*)['\"]/" , $matches[1], $paths);
    $result['cors_config_paths'] = $paths[1] ?? [];
}

// Check if environment type affects middleware loading
$envPath = $laravelRoot . '/.env';
$envContent = file_get_contents($envPath);
$appEnv = preg_match('/^APP_ENV=(.*)$/m', $envContent, $m) ? trim($m[1]) : 'NOT SET';
$result['app_env'] = $appEnv;

$result['diagnosis'] = [];

if (!$hasCors) {
    $result['diagnosis'][] = '❌ CRITICAL: HandleCors middleware not found in $middleware array!';
    $result['solution'] = 'Add \Illuminate\Http\Middleware\HandleCors::class, to protected $middleware in app/Http/Kernel.php';
} else {
    $result['diagnosis'][] = '✅ HandleCors is in global middleware';
    
    // Check if it's in the right position (should be early)
    $lines = explode("\n", $middlewareArray);
    $corsLineNum = 0;
    foreach ($lines as $i => $line) {
        if (strpos($line, 'HandleCors') !== false) {
            $corsLineNum = $i;
            break;
        }
    }
    
    if ($corsLineNum > 5) {
        $result['diagnosis'][] = '⚠️ HandleCors is late in the chain - should be earlier (check position)';
    } else {
        $result['diagnosis'][] = '✅ HandleCors appears to be in a good position';
    }
}

// Check CORS config paths - if api/* is there, it should work for /api/auth/login
$corsConfigPaths = $result['cors_config_paths'] ?? [];
if (in_array('api/*', $corsConfigPaths)) {
    $result['diagnosis'][] = '✅ CORS paths includes api/* - should cover /api/auth/login';
} else {
    $result['diagnosis'][] = '⚠️ CORS paths might not include your routes: ' . implode(', ', $corsConfigPaths);
}

// Check if the actual response headers exist
$result['diagnosis'][] = 'ℹ️ Check actual response: POST to /api/auth/login from browser and check headers';

$result['next_step'] = 'If HandleCors is missing, add it and delete bootstrap cache again';

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>
