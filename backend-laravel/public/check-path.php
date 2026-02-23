<?php
/**
 * Direct Path Verification
 * Checks the exact path structure on production server
 * 
 * Place at: backend-laravel/public/check-path.php
 * Access: https://api.lithovolt.com.au/check-path.php
 */

header('Content-Type: application/json');

$result = [
    'timestamp' => date('Y-m-d H:i:s'),
    'server_info' => [
        'script_file' => __FILE__,
        'script_dir' => __DIR__,
        'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'NOT SET',
    ],
    'path_checks' => []
];

// Check the exact path structure
$checks = [
    'current_dir (__DIR__)' => __DIR__,
    'parent_dir (dirname(__DIR__))' => dirname(__DIR__),
    'grandparent_dir' => dirname(dirname(__DIR__)),
    '../../lithovolt-api (raw)' => __DIR__ . '/../../lithovolt-api',
    '../../lithovolt-api (realpath)' => realpath(__DIR__ . '/../../lithovolt-api') ?: 'DOES NOT EXIST',
];

foreach ($checks as $name => $path) {
    $exists = file_exists($path) ? 'yes' : 'no';
    $isDir = is_dir($path) ? 'yes' : 'no';
    
    $result['path_checks'][] = [
        'description' => $name,
        'path' => $path,
        'exists' => $exists,
        'is_dir' => $isDir
    ];
}

// Check if lithovolt-api is at ../../
$larvePath = realpath(__DIR__ . '/../../lithovolt-api');
if ($larvePath && file_exists($larvePath)) {
    $result['laravel_files_at_path'] = [
        'artisan' => file_exists($larvePath . '/artisan') ? '✅ YES' : '❌ NO',
        'composer.json' => file_exists($larvePath . '/composer.json') ? '✅ YES' : '❌ NO',
        'composer.lock' => file_exists($larvePath . '/composer.lock') ? '✅ YES' : '❌ NO',
        'app' => is_dir($larvePath . '/app') ? '✅ YES' : '❌ NO',
        'config' => is_dir($larvePath . '/config') ? '✅ YES' : '❌ NO',
        'config/cors.php' => file_exists($larvePath . '/config/cors.php') ? '✅ YES' : '❌ NO',
        '.env' => file_exists($larvePath . '/.env') ? '✅ YES' : '❌ NO',
        'vendor' => is_dir($larvePath . '/vendor') ? '✅ YES' : '❌ NO',
    ];
    
    $result['laravel_root'] = $larvePath;
    $result['status'] = 'SUCCESS - Laravel found at correct path!';
}
else {
    // Check other possible locations
    $result['checking_alternatives'] = [
        'parent_dir' => dirname(__DIR__),
        'parent_dir_contents' => @array_diff(scandir(dirname(__DIR__)), ['.', '..']) ?: 'CANNOT READ'
    ];
    
    $result['status'] = 'FAILED - lithovolt-api not found at ../../';
}

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>
