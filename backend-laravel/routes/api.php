<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\BatteryModelController;
use App\Http\Controllers\Api\SerialNumberController;
use App\Http\Controllers\Api\AccessoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\WarrantyController;
use App\Http\Controllers\Api\WarrantyClaimController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\AdminController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public Routes
Route::prefix('v1')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Protected Routes
    Route::middleware('auth:sanctum')->group(function () {
        // Auth
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/profile', [AuthController::class, 'profile']);

        // Users
        Route::apiResource('users', UserController::class);
        Route::post('/users/{user}/verify', [UserController::class, 'verifyEmail']);

        // Battery Models
        Route::apiResource('battery-models', BatteryModelController::class)
            ->parameters(['battery-models' => 'battery']);

        // Serial Numbers
        Route::apiResource('serial-numbers', SerialNumberController::class)
            ->parameters(['serial-numbers' => 'serial']);
        Route::post('/serial-numbers/{serial}/allocate', [SerialNumberController::class, 'allocate']);
        Route::post('/serial-numbers/{serial}/mark-sold', [SerialNumberController::class, 'markSold']);

        // Accessories
        Route::apiResource('accessories', AccessoryController::class);

        // Orders
        Route::apiResource('orders', OrderController::class);
        Route::get('/users/{userId}/orders', [OrderController::class, 'ordersByUser']);

        // Warranties
        Route::apiResource('warranties', WarrantyController::class);
        Route::get('/warranties/qr/{qrCode}', [WarrantyController::class, 'validateQRCode']);

        // Warranty Claims
        Route::apiResource('warranty-claims', WarrantyClaimController::class)
            ->parameters(['warranty-claims' => 'claim']);
        Route::get('/warranties/{warrantyId}/claims', [WarrantyClaimController::class, 'claimsByWarranty']);

        // Notifications
        Route::get('/my-notifications', [NotificationController::class, 'userNotifications']);
        Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::post('/notifications', [NotificationController::class, 'store']);
        Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
        Route::apiResource('notifications', NotificationController::class, ['only' => ['index', 'show']])
            ->whereNumber('notification');

        // Admin Routes
        Route::prefix('admin')->middleware('admin')->group(function () {
            Route::get('/dashboard', [AdminController::class, 'dashboard']);
            Route::get('/users/stats', [AdminController::class, 'userStats']);
            Route::get('/orders/stats', [AdminController::class, 'orderStats']);
            Route::get('/warranties/stats', [AdminController::class, 'warrantyStats']);
            Route::get('/export/{model}', [AdminController::class, 'exportData']);
        });
    });
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
