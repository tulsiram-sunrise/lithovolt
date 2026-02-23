<?php
/**
 * Auto-Detect Laravel Base Path
 * Works regardless of where backend-laravel directory is located
 */

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
        // Check for Laravel indicators
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

// Find Laravel root starting from current directory
$laravelRoot = findLaravelRoot(__DIR__);

header('Content-Type: application/json');

$result = [
    'current_script_location' => __FILE__,
    'script_directory' => __DIR__,
    'detected_laravel_root' => $laravelRoot,
];

if ($laravelRoot) {
    $result['status'] = 'SUCCESS - Laravel found!';
    $result['paths'] = [
        'laravel_root' => $laravelRoot,
        'config_cors' => $laravelRoot . '/config/cors.php',
        'env_file' => $laravelRoot . '/.env',
        'artisan' => $laravelRoot . '/artisan',
        'app_kernel' => $laravelRoot . '/app/Http/Kernel.php',
    ];
    
    // Check what exists
    $result['files_found'] = [
        'config/cors.php' => file_exists($laravelRoot . '/config/cors.php'),
        '.env' => file_exists($laravelRoot . '/.env'),
        'artisan' => file_exists($laravelRoot . '/artisan'),
        'app/Http/Kernel.php' => file_exists($laravelRoot . '/app/Http/Kernel.php'),
    ];
    
    // Show directory listing
    $result['files_in_root'] = array_filter(
        scandir($laravelRoot),
        fn($item) => $item !== '.' && $item !== '..'
    );
    
} else {
    $result['status'] = 'FAILED - Cannot find Laravel root directory';
    $result['checked_paths'] = [
        __DIR__,
        dirname(__DIR__),
        dirname(dirname(__DIR__)),
        dirname(dirname(dirname(__DIR__))),
    ];
}

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>
