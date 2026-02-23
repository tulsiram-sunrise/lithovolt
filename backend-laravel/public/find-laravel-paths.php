<?php
/**
 * Laravel Path Finder - Locate where Laravel actually is on this server
 * 
 * Place at: backend-laravel/public/find-laravel-paths.php
 * Access: https://api.lithovolt.com.au/find-laravel-paths.php
 */

header('Content-Type: application/json');

$result = [
    'timestamp' => date('Y-m-d H:i:s'),
    'current_file' => __FILE__,
    'current_dir' => __DIR__,
    'parent_dir' => dirname(__DIR__),
    'paths_to_check' => [],
    'laravel_found_at' => null,
    'config_location' => null,
    'env_location' => null,
    'directory_structure' => []
];

// List of possible paths to check
$pathsToCheck = [
    dirname(__DIR__) . '/config/cors.php',                    // Standard: ../config/cors.php
    dirname(__DIR__) . '/../config/cors.php',                // If public is at different level
    dirname(dirname(__DIR__)) . '/config/cors.php',           // Two levels up
    '/home/username/public_html/config/cors.php',            // cPanel common path
    '/var/www/html/config/cors.php',                         // Linux common path
    $_SERVER['DOCUMENT_ROOT'] . '/../config/cors.php',       // Relative to document root
    realpath(dirname(__DIR__)) . '/config/cors.php',         // Resolved path
];

foreach ($pathsToCheck as $path) {
    $result['paths_to_check'][] = [
        'path' => $path,
        'exists' => file_exists($path),
        'is_file' => is_file($path),
        'is_readable' => is_readable($path) ? 'YES' : 'NO'
    ];
    
    if (file_exists($path) && is_file($path)) {
        $result['config_location'] = $path;
    }
}

// Check for .env file
$envPaths = [
    dirname(__DIR__) . '/.env',
    dirname(dirname(__DIR__)) . '/.env',
    $_SERVER['DOCUMENT_ROOT'] . '/.env',
];

foreach ($envPaths as $path) {
    if (file_exists($path)) {
        $result['env_location'] = $path;
    }
}

// Check Laravel installation
if (file_exists(dirname(__DIR__) . '/artisan')) {
    $result['laravel_found_at'] = dirname(__DIR__);
}

// Show directory structure
$parentDir = dirname(__DIR__);
if (is_dir($parentDir)) {
    $items = scandir($parentDir);
    $result['directory_structure'] = array_filter($items, function($item) {
        return $item !== '.' && $item !== '..';
    });
}

// Show full path of current public directory
$result['public_html_equivalent'] = $_SERVER['DOCUMENT_ROOT'] ?? 'NOT SET';
$result['script_path_from_root'] = str_replace($_SERVER['DOCUMENT_ROOT'], '', __FILE__);

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
