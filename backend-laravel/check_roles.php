<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$app->make(\Illuminate\Contracts\Http\Kernel::class);

\Illuminate\Support\Facades\Facade::setFacadeApplication($app);

echo "Roles in database:\n";
$roles = \App\Models\Role::all(['id', 'name']);
foreach ($roles as $role) {
    echo "  id={$role->id}, name={$role->name}\n";
}

echo "\nAdmin user role assignment:\n";
$admin = \App\Models\User::where('email', 'admin@lithovolt.com.au')->first();
if ($admin) {
    echo "  admin email: {$admin->email}\n";
    echo "  admin role_id: {$admin->role_id}\n";
    echo "  admin role name: {$admin->role?->name}\n";
} else {
    echo "  Admin user not found!\n";
}
