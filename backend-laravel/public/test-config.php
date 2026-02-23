<?php
/**
 * Simple Configuration Tester - No Laravel Required
 * 
 * This lightweight script helps diagnose issues WITHOUT loading Laravel
 * Place at: backend-laravel/public/test-config.php
 * Access: https://domain.com/backend-laravel/public/test-config.php
 * 
 * ⚠️ Delete after use!
 */

// Set JSON header
header('Content-Type: application/json; charset=utf-8');

// Don't display errors (prevent JSON corruption)
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Catch all errors as JSON
set_error_handler(function($errno, $errstr) {
    http_response_code(500);
    exit(json_encode(['error' => 'PHP ' . $errstr], JSON_UNESCAPED_SLASHES));
});

set_exception_handler(function($e) {
    http_response_code(500);
    exit(json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_SLASHES));
});

// ============================================================================
// SAFE PATH DETECTION (No Laravel required)
// ============================================================================

$result = [
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => phpversion(),
    'script_location' => __FILE__,
    'script_dir' => __DIR__,
    'parent_dir' => dirname(__DIR__),
    'checks' => []
];

// Check 1: One level up
$path1 = dirname(__DIR__);
$check1 = [
    'path' => $path1,
    'vendor_exists' => file_exists($path1 . '/vendor/autoload.php'),
    'env_exists' => file_exists($path1 . '/.env'),
    'bootstrap_exists' => file_exists($path1 . '/bootstrap/app.php'),
];
$result['checks']['one_level_up'] = $check1;

// Check 2: Two levels up
$path2 = dirname(dirname(__DIR__));
$check2 = [
    'path' => $path2,
    'vendor_exists' => file_exists($path2 . '/vendor/autoload.php'),
    'env_exists' => file_exists($path2 . '/.env'),
    'bootstrap_exists' => file_exists($path2 . '/bootstrap/app.php'),
];
$result['checks']['two_levels_up'] = $check2;

// Check 3: Three levels up
$path3 = dirname(dirname(dirname(__DIR__)));
$check3 = [
    'path' => $path3,
    'vendor_exists' => file_exists($path3 . '/vendor/autoload.php'),
    'env_exists' => file_exists($path3 . '/.env'),
    'bootstrap_exists' => file_exists($path3 . '/bootstrap/app.php'),
];
$result['checks']['three_levels_up'] = $check3;

// Determine which path to use
$basePath = null;
if ($check1['vendor_exists']) {
    $basePath = $path1;
    $result['detected_base_path'] = $path1;
    $result['status'] = 'SUCCESS';
} elseif ($check2['vendor_exists']) {
    $basePath = $path2;
    $result['detected_base_path'] = $path2;
    $result['status'] = 'SUCCESS';
} elseif ($check3['vendor_exists']) {
    $basePath = $path3;
    $result['detected_base_path'] = $path3;
    $result['status'] = 'SUCCESS';
} else {
    $result['status'] = 'VENDOR_NOT_FOUND';
    $result['message'] = 'Could not find vendor/autoload.php in any expected location';
    $result['solutions'] = [
        'Solution 1: Run composer install',
        'In cPanel Terminal/SSH: cd ' . $path1 . ' && composer install',
        'Solution 2: Check if Laravel files are uploaded completely',
        'Solution 3: Check file permissions - should be readable'
    ];
}

// Additional checks
$result['directory_readable'] = is_readable(__DIR__);
$result['parent_readable'] = is_readable(dirname(__DIR__));
$result['memory_limit'] = ini_get('memory_limit');
$result['upload_max_filesize'] = ini_get('upload_max_filesize');

// Try to find Laravel directories
$result['found_directories'] = [];
foreach (scandir(dirname(__DIR__), SCANDIR_SORT_NONE) as $item) {
    if ($item[0] === '.') continue;
    $fullPath = dirname(__DIR__) . '/' . $item;
    if (is_dir($fullPath)) {
        $result['found_directories'][] = $item;
    }
}

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>
