<?php
/**
 * CORS Middleware Verification
 * Checks if CORS middleware is actually enabled and running
 * 
 * Place at: backend-laravel/public/check-cors-middleware.php
 * Access: https://api.lithovolt.com.au/check-cors-middleware.php
 */

header('Content-Type: application/json');

$result = [
    'timestamp' => date('Y-m-d H:i:s'),
    'checks' => [],
    'issues' => [],
    'solutions' => []
];

// 1. Find Laravel root
$laravelRoot = null;
$testPath = realpath(__DIR__ . '/../../lithovolt-api');
if ($testPath && file_exists($testPath . '/artisan')) {
    $laravelRoot = $testPath;
}

if (!$laravelRoot) {
    echo json_encode(['error' => 'Laravel root not found']);
    exit;
}

$result['laravel_root'] = $laravelRoot;

// 2. Check if bootstrap cache exists (MAJOR issue)
$bootstrapCachePath = $laravelRoot . '/bootstrap/cache';
$result['checks']['bootstrap_cache_exists'] = is_dir($bootstrapCachePath);

if (is_dir($bootstrapCachePath)) {
    $cacheFiles = @scandir($bootstrapCachePath);
    $result['bootstrap_cache_files'] = $cacheFiles ?: [];
    
    if (count($cacheFiles) > 2) { // More than . and ..
        $result['issues'][] = '⚠️ Bootstrap cache files exist - they may be stale';
        $result['solutions'][] = 'DELETE these files via cPanel File Manager: /lithovolt-api/bootstrap/cache/*';
    }
}

// 3. Check Kernel.php for middleware
$kernelPath = $laravelRoot . '/app/Http/Kernel.php';
$kernelContent = file_get_contents($kernelPath);

$result['checks']['handlecors_in_global_middleware'] = strpos($kernelContent, 'HandleCors') !== false && 
    strpos($kernelContent, 'protected $middleware') !== false;

// Check if it's in the right place (global middleware, not route middleware)
if (preg_match('/protected\s+\$middleware\s*=\s*\[(.*?)HandleCors/s', $kernelContent)) {
    $result['checks']['handlecors_in_global_list'] = true;
} else {
    $result['checks']['handlecors_in_global_list'] = false;
    $result['issues'][] = '❌ HandleCors NOT in global $middleware list';
    $result['solutions'][] = 'Add HandleCors to global middleware in app/Http/Kernel.php';
}

// 4. Check .env file
$envPath = $laravelRoot . '/.env';
$result['checks']['env_file_exists'] = file_exists($envPath);
$result['checks']['env_file_readable'] = is_readable($envPath);

if (file_exists($envPath)) {
    $envContent = file_get_contents($envPath);
    $result['env_values'] = [
        'APP_ENV' => preg_match('/^APP_ENV=(.*)$/m', $envContent, $m) ? trim($m[1]) : 'NOT SET',
        'APP_DEBUG' => preg_match('/^APP_DEBUG=(.*)$/m', $envContent, $m) ? trim($m[1]) : 'NOT SET',
    ];
    
    if ($result['env_values']['APP_ENV'] !== 'production') {
        $result['issues'][] = '⚠️ APP_ENV is not "production"';
    }
}

// 5. Check if config cache exists
$configCachePath = $laravelRoot . '/bootstrap/cache/config.php';
$result['checks']['config_cache_exists'] = file_exists($configCachePath);

if (file_exists($configCachePath)) {
    $result['issues'][] = '⚠️ Config cache file exists - may be preventing CORS from loading';
}

// 6. Summary
if (empty($result['issues'])) {
    $result['status'] = 'ALL CHECKS PASSED - CORS should be working';
} else {
    $result['status'] = 'ISSUES FOUND - See solutions below';
    $result['action'] = 'Follow the solutions to fix CORS';
}

echo json_encode($result, JSON_PRETTY_PRINT);
?>
