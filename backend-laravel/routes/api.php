<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\BatteryModelController;
use App\Http\Controllers\Api\SerialNumberController;
use App\Http\Controllers\Api\AccessoryController;
use App\Http\Controllers\Api\ProductCategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\WarrantyController;
use App\Http\Controllers\Api\WarrantyClaimController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\StaffUserController;

/*
|--------------------------------------------------------------------------
| API Routes (Matching Python Backend Structure)
|--------------------------------------------------------------------------
|
| Routes configured to match Python backend exactly for frontend compatibility
|
*/

// ====== PUBLIC AUTHENTICATION ROUTES ======
Route::prefix('auth')->group(function () {
    // Standard Auth
    Route::post('/register/', [AuthController::class, 'register']);
    Route::post('/login/', [AuthController::class, 'login']);
    
    // OTP Authentication
    Route::post('/otp/send/', [AuthController::class, 'sendOtp']);
    Route::post('/otp/verify/', [AuthController::class, 'verifyOtp']);
    
    // Password Reset
    Route::post('/password-reset/', [AuthController::class, 'passwordResetRequest']);
    Route::post('/password-reset/confirm/', [AuthController::class, 'passwordResetConfirm']);
});

// ====== PROTECTED ROUTES ======
Route::middleware('auth:jwt')->group(function () {
    // Auth - Authenticated routes
    Route::prefix('auth')->group(function () {
        Route::post('/logout/', [AuthController::class, 'logout']);
        Route::post('/refresh/', [AuthController::class, 'refresh']);
        Route::get('/profile/', [AuthController::class, 'profile']);
    });
    
    // Users
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::post('/', [UserController::class, 'store']);
        Route::get('/{user}/', [UserController::class, 'show']);
        Route::put('/{user}/', [UserController::class, 'update']);
        Route::delete('/{user}/', [UserController::class, 'destroy']);
        Route::post('/{user}/verify/', [UserController::class, 'verifyEmail']);
    });
    
    // Inventory - Battery Models
    Route::prefix('inventory/models')->group(function () {
        Route::get('/', [BatteryModelController::class, 'index']);
        Route::post('/', [BatteryModelController::class, 'store']);
        Route::get('/{battery}/', [BatteryModelController::class, 'show']);
        Route::put('/{battery}/', [BatteryModelController::class, 'update']);
        Route::delete('/{battery}/', [BatteryModelController::class, 'destroy']);
    });
    
    // Inventory - Serial Numbers
    Route::prefix('inventory/serials')->group(function () {
        Route::get('/', [SerialNumberController::class, 'index']);
        Route::post('/', [SerialNumberController::class, 'store']);
        Route::post('/generate/', [SerialNumberController::class, 'generate']);
        Route::get('/{serial}/', [SerialNumberController::class, 'show']);
        Route::put('/{serial}/', [SerialNumberController::class, 'update']);
        Route::delete('/{serial}/', [SerialNumberController::class, 'destroy']);
        Route::post('/{serial}/allocate/', [SerialNumberController::class, 'allocate']);
        Route::post('/{serial}/mark-sold/', [SerialNumberController::class, 'markSold']);
    });
    
    // Inventory - Accessories
    Route::prefix('inventory/accessories')->group(function () {
        Route::get('/', [AccessoryController::class, 'index']);
        Route::post('/', [AccessoryController::class, 'store']);
        Route::get('/{accessory}/', [AccessoryController::class, 'show']);
        Route::put('/{accessory}/', [AccessoryController::class, 'update']);
        Route::delete('/{accessory}/', [AccessoryController::class, 'destroy']);
    });

    // Inventory - Product Categories
    Route::prefix('inventory/categories')->group(function () {
        Route::get('/', [ProductCategoryController::class, 'index']);
        Route::post('/', [ProductCategoryController::class, 'store']);
        Route::get('/{category}/', [ProductCategoryController::class, 'show']);
        Route::put('/{category}/', [ProductCategoryController::class, 'update']);
        Route::delete('/{category}/', [ProductCategoryController::class, 'destroy']);
    });

    // Inventory - Products
    Route::prefix('inventory/products')->group(function () {
        Route::get('/', [ProductController::class, 'index']);
        Route::post('/', [ProductController::class, 'store']);
        Route::get('/{product}/', [ProductController::class, 'show']);
        Route::put('/{product}/', [ProductController::class, 'update']);
        Route::delete('/{product}/', [ProductController::class, 'destroy']);
    });
    
    // Orders
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::post('/', [OrderController::class, 'store']);
        Route::get('/{order}/', [OrderController::class, 'show']);
        Route::put('/{order}/', [OrderController::class, 'update']);
        Route::delete('/{order}/', [OrderController::class, 'destroy']);
        Route::get('/user/{userId}/', [OrderController::class, 'ordersByUser']);
    });
    
    // Warranties
    Route::prefix('warranties')->group(function () {
        Route::get('/', [WarrantyController::class, 'index']);
        Route::post('/', [WarrantyController::class, 'store']);
        Route::get('/{warranty}/', [WarrantyController::class, 'show']);
        Route::put('/{warranty}/', [WarrantyController::class, 'update']);
        Route::delete('/{warranty}/', [WarrantyController::class, 'destroy']);
        Route::get('/verify/{serialNumber}/', [WarrantyController::class, 'verify']);
    });
    
    // Warranty Claims
    Route::prefix('warranty-claims')->group(function () {
        Route::get('/', [WarrantyClaimController::class, 'index']);
        Route::post('/', [WarrantyClaimController::class, 'store']);
        Route::get('/{claim}/', [WarrantyClaimController::class, 'show']);
        Route::put('/{claim}/', [WarrantyClaimController::class, 'update']);
        Route::delete('/{claim}/', [WarrantyClaimController::class, 'destroy']);
    });
    
    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::post('/', [NotificationController::class, 'store']);
        Route::get('/{notification}/', [NotificationController::class, 'show']);
        Route::post('/{notification}/read/', [NotificationController::class, 'markAsRead']);
    });
    
    // Admin Routes
    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('/metrics/', [AdminController::class, 'metrics']);
        Route::get('/dashboard/', [AdminController::class, 'dashboard']);
        Route::get('/users/stats/', [AdminController::class, 'userStats']);
        Route::get('/orders/stats/', [AdminController::class, 'orderStats']);
        Route::get('/warranties/stats/', [AdminController::class, 'warrantyStats']);
        Route::get('/export/{model}/', [AdminController::class, 'exportData']);
        
        // Role Management
        Route::prefix('roles')->group(function () {
            Route::get('/', [RoleController::class, 'index']);
            Route::post('/', [RoleController::class, 'store']);
            Route::get('/{role}/', [RoleController::class, 'show']);
            Route::put('/{role}/', [RoleController::class, 'update']);
            Route::delete('/{role}/', [RoleController::class, 'destroy']);
        });
        
        // Permission Management
        Route::prefix('permissions')->group(function () {
            Route::get('/', [PermissionController::class, 'index']);
            Route::post('/', [PermissionController::class, 'store']);
            Route::put('/{permission}/', [PermissionController::class, 'update']);
            Route::delete('/{permission}/', [PermissionController::class, 'destroy']);
            Route::post('/bulk-assign/', [PermissionController::class, 'bulkAssign']);
        });
        
        // Staff User Management
        Route::prefix('staff')->group(function () {
            Route::get('/', [StaffUserController::class, 'index']);
            Route::post('/', [StaffUserController::class, 'store']);
            Route::get('/{staff}/', [StaffUserController::class, 'show']);
            Route::put('/{staff}/', [StaffUserController::class, 'update']);
            Route::delete('/{staff}/', [StaffUserController::class, 'destroy']);
        });
    });
});

// Generic JWT authenticated user route
Route::middleware('auth:jwt')->get('/user/', function (Request $request) {
    return $request->user();
});
