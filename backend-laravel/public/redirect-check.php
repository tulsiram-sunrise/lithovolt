<?php
/**
 * Check which .htaccess is being used and whether OPTIONS is excluded.
 */

header('Content-Type: application/json');

$dir = __DIR__;
$checks = [];

$paths = [
    $dir . '/.htaccess',
    dirname($dir) . '/.htaccess',
    dirname(dirname($dir)) . '/.htaccess',
];

foreach ($paths as $path) {
    $entry = [
        'path' => $path,
        'exists' => file_exists($path),
        'readable' => is_readable($path),
        'has_no_options_redirect' => false,
    ];

    if ($entry['exists'] && $entry['readable']) {
        $content = file_get_contents($path);
        $entry['has_no_options_redirect'] = strpos($content, 'RewriteCond %{REQUEST_METHOD} !OPTIONS') !== false;
    }

    $checks[] = $entry;
}

$result = [
    'timestamp' => date('Y-m-d H:i:s'),
    'script_dir' => __DIR__,
    'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'NOT SET',
    'checks' => $checks,
];

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
