<?php
$db = new PDO('mysql:host=127.0.0.1;dbname=lithovolt_db', 'root', '');

echo "=== ADMIN Role ===\n";
$role = $db->query("SELECT * FROM roles WHERE name='ADMIN'")->fetch(PDO::FETCH_ASSOC);
var_dump($role);

echo "\n=== ADMIN Permissions ===\n";
$perms = $db->query("SELECT resource, action FROM permissions WHERE role_id={$role['id']}")->fetchAll(PDO::FETCH_ASSOC);
foreach ($perms as $p) {
    echo "  {$p['resource']} {$p['action']}\n";
}

echo "\n=== Admin User Staff Record ===\n";
$admin = $db->query("SELECT * FROM users WHERE email='admin@lithovolt.com.au'")->fetch(PDO::FETCH_ASSOC);
echo "Admin ID: {$admin['id']}, Role ID: {$admin['role_id']}\n";

$staff = $db->query("SELECT * FROM staff_users WHERE user_id={$admin['id']}")->fetch(PDO::FETCH_ASSOC);
if ($staff) {
    echo "Staff ID: {$staff['id']}, Role ID: {$staff['role_id']}, Is Active: {$staff['is_active']}\n";
    $srole = $db->query("SELECT * FROM roles WHERE id={$staff['role_id']}")->fetch(PDO::FETCH_ASSOC);
    echo "Staff Role: {$srole['name']}, Active: {$srole['is_active']}\n";
} else {
    echo "No staff user record\n";
}
