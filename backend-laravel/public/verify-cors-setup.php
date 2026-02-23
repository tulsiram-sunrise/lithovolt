<?php
/**
 * CORS Setup Verification Script
 * Auto-detects Laravel root directory
 * 
 * Place at: backend-laravel/public/verify-cors-setup.php
 * Access: https://api.lithovolt.com.au/verify-cors-setup.php
 */

header('Content-Type: application/json');

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

$checks = [
    'timestamp' => date('Y-m-d H:i:s'),
    'script_location' => __FILE__,
    'detected_laravel_root' => $laravelRoot,
];

if (!$laravelRoot) {
    $checks['status'] = 'FAILED - Cannot find Laravel root directory';
    $checks['solution'] = 'Place this script in backend-laravel/public/ directory';
    echo json_encode($checks, JSON_PRETTY_PRINT);
    exit;
}

$checks['laravel_root'] = $laravelRoot;

// 1. Check if config/cors.php exists
$corsConfigPath = $laravelRoot . '/config/cors.php';
$checks['cors_config_file'] = [
    'path' => $corsConfigPath,
    'exists' => file_exists($corsConfigPath),
    'readable' => is_readable($corsConfigPath)
];

if (file_exists($corsConfigPath)) {
    $corsConfig = require $corsConfigPath;
    $checks['cors_config_content'] = [
        'paths' => $corsConfig['paths'] ?? [],
        'allowed_origins' => $corsConfig['allowed_origins'] ?? [],
        'allowed_methods' => $corsConfig['allowed_methods'] ?? [],
        'supports_credentials' => $corsConfig['supports_credentials'] ?? false,
        'max_age' => $corsConfig['max_age'] ?? null
    ];
}

// 2. Check .env file
$envPath = $laravelRoot . '/.env';
$checks['env_file'] = [
    'path' => $envPath,
    'exists' => file_exists($envPath)
];

if (file_exists($envPath)) {
    $envContent = file_get_contents($envPath);
    $checks['env_values'] = [
        'APP_ENV' => preg_match('/^APP_ENV=(.*)$/m', $envContent, $m) ? trim($m[1]) : 'NOT SET',
        'APP_DEBUG' => preg_match('/^APP_DEBUG=(.*)$/m', $envContent, $m) ? trim($m[1]) : 'NOT SET',
        'APP_URL' => preg_match('/^APP_URL=(.*)$/m', $envContent, $m) ? trim($m[1]) : 'NOT SET',
        'CORS_MAX_AGE' => preg_match('/^CORS_MAX_AGE=(.*)$/m', $envContent, $m) ? trim($m[1]) : 'NOT SET',
    ];
}

// 3. Check if Kernel.php exists and has CORS middleware
$kernelPath = $laravelRoot . '/app/Http/Kernel.php';
$checks['kernel_file'] = [
    'path' => $kernelPath,
    'exists' => file_exists($kernelPath)
];

if (file_exists($kernelPath)) {
    $kernelContent = file_get_contents($kernelPath);
    $checks['cors_middleware_checks'] = [
        'contains_handlecors' => strpos($kernelContent, 'HandleCors') !== false,
        'has_middleware_group' => strpos($kernelContent, '$middleware') !== false,
        'kernel_snippet' => 'View full file content for detailed analysis'
    ];
}

// 4. Check if fruitcake/laravel-cors is installed
$composerLockPath = $laravelRoot . '/composer.lock';
$corsPackageInstalled = false;

if (file_exists($composerLockPath)) {
    $composerLock = json_decode(file_get_contents($composerLockPath), true);
    foreach ($composerLock['packages'] ?? [] as $package) {
        if (strpos($package['name'], 'cors') !== false) {
            $corsPackageInstalled = true;
            $checks['cors_package'] = $package['name'] . ' (' . $package['version'] . ')';
        }
    }
}

$checks['fruitcake_cors_installed'] = $corsPackageInstalled;

// 5. Summary and recommendations
$issues = [];

if (!$checks['cors_config_file']['exists']) {
    $issues[] = "❌ config/cors.php is MISSING - Need to upload this file";
}

if ($checks['env_values']['APP_ENV'] !== 'production') {
    $issues[] = "❌ APP_ENV is not set to 'production' - Set it in .env";
}

if ($checks['env_values']['APP_DEBUG'] !== 'false') {
    $issues[] = "❌ APP_DEBUG is not set to 'false' - Set it in .env";
}

if ($checks['env_values']['CORS_MAX_AGE'] === 'NOT SET') {
    $issues[] = "⚠️  CORS_MAX_AGE not set in .env - Add: CORS_MAX_AGE=86400";
}

if (!$corsPackageInstalled) {
    $issues[] = "❌ fruitcake/laravel-cors package not installed - Run: composer require fruitcake/laravel-cors";
}

if (!$checks['cors_middleware_checks']['contains_handlecors']) {
    $issues[] = "❌ HandleCors middleware not found in Kernel.php - Add it to middleware list";
}

$checks['issues_found'] = $issues;
$checks['total_issues'] = count($issues);

echo json_encode($checks, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>
