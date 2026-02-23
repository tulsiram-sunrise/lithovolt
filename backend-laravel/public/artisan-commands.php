<?php
/**
 * Laravel Cache Clearer - Web-Based Artisan Commands
 * 
 * Place this file in: backend-laravel/public/artisan-commands.php
 * Access via: https://api.lithovolt.com.au/artisan-commands.php
 * 
 * ⚠️  SECURITY: Delete this file after use!
 */

// Verify password for security
$PASSWORD = 'your-secret-password-here';  // ← CHANGE THIS!

// Get the command parameter
$command = isset($_GET['cmd']) ? $_GET['cmd'] : null;
$password = isset($_GET['pwd']) ? $_GET['pwd'] : null;

// Verify password
if ($password !== $PASSWORD) {
    http_response_code(401);
    die(json_encode([
        'status' => 'error',
        'message' => 'Unauthorized - Invalid password'
    ]));
}

// Load Laravel
$basePath = dirname(__DIR__);
require_once $basePath . '/vendor/autoload.php';
$app = require_once $basePath . '/bootstrap/app.php';

// Get the console kernel
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);

// Allowed commands (whitelist for safety)
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

// Execute command
if (!$command) {
    echo json_encode([
        'status' => 'info',
        'message' => 'No command specified',
        'allowed_commands' => $allowed_commands,
        'usage' => 'artisan-commands.php?pwd=your-password&cmd=config:clear'
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

// Run the command
ob_start();
try {
    $status = $kernel->call($command);
    $output = ob_get_clean();
    
    echo json_encode([
        'status' => 'success',
        'command' => $command,
        'exit_code' => $status,
        'output' => $output
    ]);
} catch (Exception $e) {
    ob_end_clean();
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'command' => $command,
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>
