<?php
/**
 * Laravel Artisan Commands - Web-Based Executor
 * 
 * For cPanel/Shared Hosting without SSH access
 * 
 * Works with two setups:
 * A) Laravel inside public_html: /public_html/backend-laravel/public/
 * B) Laravel outside public_html: /backend-laravel/public/ (with wrapper in public_html)
 * 
 * ⚠️  SECURITY: Delete this file after use!
 */

// ============================================================================
// SECURITY & ERROR HANDLING SETUP
// ============================================================================

// Set JSON header immediately
header('Content-Type: application/json');

// Disable error display (prevent corrupting JSON output)
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Catch fatal errors
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    die(json_encode([
        'status' => 'error',
        'message' => 'PHP Error: ' . $errstr,
        'file' => basename($errfile),
        'line' => $errline
    ]));
});

set_exception_handler(function($exception) {
    http_response_code(500);
    die(json_encode([
        'status' => 'error',
        'message' => 'Exception: ' . $exception->getMessage(),
        'file' => basename($exception->getFile()),
        'line' => $exception->getLine()
    ]));
});

// ============================================================================
// CONFIGURATION - CHANGE THESE!
// ============================================================================

$PASSWORD = 'your-secret-password-here';  // ← CHANGE TO STRONG PASSWORD!

// ============================================================================
// PATH DETECTION (Auto-detects Laravel location)
// ============================================================================

// This file is at: /[laravel]/public/artisan-commands.php
// We need to find: /[laravel]/vendor/autoload.php

$basePath = null;
$pathsChecked = [];

// Method 1: Standard - Laravel inside public_html
// /public_html/backend-laravel/public/ → /public_html/backend-laravel/
$testPath = dirname(__DIR__);
$pathsChecked[] = $testPath . '/vendor/autoload.php';
if (file_exists($testPath . '/vendor/autoload.php')) {
    $basePath = $testPath;
}

// Method 2: Two levels up (if in subdirectory)
if (!$basePath) {
    $testPath = dirname(dirname(__DIR__));
    $pathsChecked[] = $testPath . '/vendor/autoload.php';
    if (file_exists($testPath . '/vendor/autoload.php')) {
        $basePath = $testPath;
    }
}

// Method 3: Explicitly set if methods above fail
// Edit this if auto-detection doesn't work:
if (!$basePath) {
    // Uncomment and set your actual path:
    // $basePath = '/home/yourusername/public_html/backend-laravel';
    // $pathsChecked[] = $basePath . '/vendor/autoload.php';
    // if (file_exists($basePath . '/vendor/autoload.php')) {
    //     // Keep $basePath as is
    // }
}

// ============================================================================
// GET PARAMETERS
// ============================================================================

$command = isset($_GET['cmd']) ? trim($_GET['cmd']) : null;
$password = isset($_GET['pwd']) ? $_GET['pwd'] : null;
$test = isset($_GET['test']);

// ============================================================================
// HANDLE TEST REQUEST
// ============================================================================

if ($test) {
    echo json_encode([
        'status' => 'info',
        'message' => 'Configuration Check',
        'data' => [
            'script_location' => __FILE__,
            'script_dir' => __DIR__,
            'parent_dir' => dirname(__DIR__),
            'paths_checked' => $pathsChecked,
            'base_path_found' => $basePath ? 'YES' : 'NO',
            'base_path' => $basePath,
            'vendor_exists' => $basePath ? file_exists($basePath . '/vendor/autoload.php') : false,
            'env_exists' => $basePath ? file_exists($basePath . '/.env') : false,
            'bootstrap_exists' => $basePath ? file_exists($basePath . '/bootstrap/app.php') : false,
            'php_version' => phpversion(),
            'memory_limit' => ini_get('memory_limit'),
        ]
    ]);
    die;
}

// ============================================================================
// VERIFY PASSWORD
// ============================================================================

if ($password !== $PASSWORD) {
    http_response_code(401);
    echo json_encode([
        'status' => 'error',
        'message' => 'Unauthorized - Invalid password',
        'hint' => 'Check the password in artisan-commands.php file'
    ]);
    die;
}

// ============================================================================
// VERIFY LARAVEL PATH
// ============================================================================

if (!$basePath || !file_exists($basePath . '/vendor/autoload.php')) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Cannot locate Laravel installation - vendor/autoload.php not found',
        'solution' => 'Path detection failed. Please manually set the path in artisan-commands.php',
        'instructions' => [
            '1. Find your Laravel directory path (ask hosting support)',
            '2. Edit artisan-commands.php around line 52',
            '3. Uncomment and set: $basePath = \'/exact/path/to/backend-laravel\';',
            '4. Save and upload the file'
        ],
        'example_paths' => [
            '/home/username/public_html/backend-laravel',
            '/var/www/html/backend-laravel',
            '/usr/share/nginx/html/backend-laravel'
        ],
        'debug_info' => [
            'checked_paths' => $pathsChecked,
            'current_file' => __FILE__
        ]
    ]);
    die;
}

// ============================================================================
// LOAD LARAVEL
// ============================================================================

try {
    // Suppress warning messages
    // We're using require_once, so it won't be included twice
    if (!file_exists($basePath . '/vendor/autoload.php')) {
        throw new Exception('autoload.php does not exist at: ' . $basePath . '/vendor/autoload.php');
    }
    
    if (!file_exists($basePath . '/bootstrap/app.php')) {
        throw new Exception('bootstrap/app.php does not exist at: ' . $basePath . '/bootstrap/app.php');
    }
    
    require_once $basePath . '/vendor/autoload.php';
    $app = require_once $basePath . '/bootstrap/app.php';
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to load Laravel: ' . $e->getMessage(),
        'base_path' => $basePath,
        'tip' => 'Make sure all Laravel files are uploaded correctly'
    ]);
    die;
}

// ============================================================================
// GET CONSOLE KERNEL
// ============================================================================

try {
    $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Cannot access Laravel console: ' . $e->getMessage()
    ]);
    die;
}

// ============================================================================
// ALLOWED COMMANDS (WHITELIST)
// ============================================================================

$allowed_commands = [
    'config:clear',
    'config:cache',
    'route:cache',
    'view:clear',
    'cache:clear',
    'optimize:clear',
    'queue:restart',
    'migrate',
    'seed',
];

// ============================================================================
// VALIDATE COMMAND
// ============================================================================

if (!$command) {
    echo json_encode([
        'status' => 'info',
        'message' => 'No command specified',
        'allowed_commands' => $allowed_commands,
        'usage' => 'artisan-commands.php?pwd=your-password&cmd=config:clear',
        'test_url' => 'artisan-commands.php?test=1'
    ]);
    die;
}

if (!in_array($command, $allowed_commands)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => "Command not allowed: $command",
        'allowed_commands' => $allowed_commands
    ]);
    die;
}

// ============================================================================
// EXECUTE COMMAND
// ============================================================================

try {
    ob_start();
    $exit_code = $kernel->call($command);
    $output = ob_get_clean();
    
    // Ensure we have valid output
    if ($exit_code === 0) {
        http_response_code(200);
    } else {
        http_response_code(500);
    }
    
    echo json_encode([
        'status' => $exit_code === 0 ? 'success' : 'error',
        'command' => $command,
        'exit_code' => $exit_code,
        'output' => trim($output) ?: '(command executed silently)'
    ]);
    
} catch (Exception $e) {
    if (ob_get_level() > 0) {
        ob_end_clean();
    }
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'command' => $command,
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>

