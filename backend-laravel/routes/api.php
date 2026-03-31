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
use App\Http\Controllers\Api\VehicleFitmentController;
use App\Http\Controllers\Api\CatalogItemController;

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

    // Email Verification
    Route::get('/verify-email/', [AuthController::class, 'verifyEmail']);
});

// Public fitment lookup (throttled)
Route::get('/catalog/models/', [BatteryModelController::class, 'publicIndex']);
Route::get('/warranties/verify/{serialNumber}/', [WarrantyController::class, 'verify'])
    ->middleware('throttle:40,1');
Route::post('/fitment/registration-lookup/', [VehicleFitmentController::class, 'registrationLookup'])
    ->middleware('throttle:20,1');
Route::post('/fitment/vehicle-lookup/', [VehicleFitmentController::class, 'vehicleLookup'])
    ->middleware('throttle:20,1');
Route::post('/orders/stripe/webhook/', [OrderController::class, 'stripeWebhook'])
    ->middleware('throttle:120,1');

// ====== PROTECTED ROUTES ======
Route::middleware('auth:jwt')->group(function () {
    // Auth - Authenticated routes
    Route::prefix('auth')->group(function () {
        Route::post('/logout/', [AuthController::class, 'logout']);
        Route::post('/refresh/', [AuthController::class, 'refresh']);
        Route::get('/profile/', [AuthController::class, 'profile']);
        Route::patch('/profile/', [AuthController::class, 'updateProfile']);
        Route::post('/change-password/', [AuthController::class, 'changePassword']);
    });
    
    // Users
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index'])->middleware('backoffice.permission:USERS,VIEW');
        Route::post('/', [UserController::class, 'store'])->middleware('backoffice.permission:USERS,CREATE');
        Route::get('/wholesaler-applications', [UserController::class, 'getWholesalerApplications']);
        Route::post('/wholesaler-applications', [UserController::class, 'submitWholesalerApplication']);
        Route::get('/wholesaler-applications/{id}', [UserController::class, 'getWholesalerApplication']);
        Route::post('/wholesaler-applications/{id}/approve', [UserController::class, 'approveWholesalerApplication'])->middleware('backoffice.permission:USERS,APPROVE');
        Route::post('/wholesaler-applications/{id}/reject', [UserController::class, 'rejectWholesalerApplication'])->middleware('backoffice.permission:USERS,APPROVE');
        Route::post('/invite-wholesaler/', [UserController::class, 'inviteWholesaler'])->middleware('backoffice.permission:USERS,CREATE');
        Route::get('/{user}/', [UserController::class, 'show'])->middleware('backoffice.permission:USERS,VIEW');
        Route::put('/{user}/', [UserController::class, 'update'])->middleware('backoffice.permission:USERS,UPDATE');
        Route::delete('/{user}/', [UserController::class, 'destroy'])->middleware('backoffice.permission:USERS,DELETE');
        Route::post('/{user}/verify/', [UserController::class, 'verifyEmail'])->middleware('backoffice.permission:USERS,UPDATE');
        Route::post('/{user}/toggle_active', [UserController::class, 'toggleActive'])->middleware('backoffice.permission:USERS,UPDATE');
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

    // Inventory - Allocations
    Route::prefix('inventory/allocations')->group(function () {
        Route::get('/', [SerialNumberController::class, 'allocationsIndex']);
        Route::post('/', [SerialNumberController::class, 'allocateStock']);
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

    // Unified Catalog (new backbone)
    Route::prefix('inventory/catalog')->group(function () {
        Route::get('/summary/', [CatalogItemController::class, 'summary']);
        Route::get('/', [CatalogItemController::class, 'index']);
        Route::post('/', [CatalogItemController::class, 'store']);
        Route::get('/{catalogItem}/', [CatalogItemController::class, 'show']);
        Route::put('/{catalogItem}/', [CatalogItemController::class, 'update']);
        Route::delete('/{catalogItem}/', [CatalogItemController::class, 'destroy']);
    });
    
    // Orders
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::post('/', [OrderController::class, 'store']);
        Route::get('/{order}/', [OrderController::class, 'show']);
        Route::put('/{order}/', [OrderController::class, 'update']);
        Route::delete('/{order}/', [OrderController::class, 'destroy']);
        Route::post('/{order}/accept/', [OrderController::class, 'accept']);
        Route::post('/{order}/reject/', [OrderController::class, 'reject']);
        Route::post('/{order}/cancel/', [OrderController::class, 'cancel']);
        Route::post('/{order}/fulfill/', [OrderController::class, 'fulfill']);
        Route::get('/{order}/invoice/', [OrderController::class, 'invoice']);
        Route::get('/user/{userId}/', [OrderController::class, 'ordersByUser']);
    });
    
    // Warranties
    Route::prefix('warranties')->group(function () {
        Route::get('/', [WarrantyController::class, 'index']);
        Route::post('/', [WarrantyController::class, 'store']);
        Route::get('/{warranty}/', [WarrantyController::class, 'show']);
        Route::put('/{warranty}/', [WarrantyController::class, 'update']);
        Route::delete('/{warranty}/', [WarrantyController::class, 'destroy']);
    });
    
    // Warranty Claims
    Route::prefix('warranty-claims')->group(function () {
        Route::get('/', [WarrantyClaimController::class, 'index']);
        Route::post('/', [WarrantyClaimController::class, 'store']);
        Route::get('/warranty/{warrantyId}/', [WarrantyClaimController::class, 'claimsByWarranty']);
        Route::get('/{claim}/', [WarrantyClaimController::class, 'show']);
        Route::put('/{claim}/', [WarrantyClaimController::class, 'update']);
        Route::delete('/{claim}/', [WarrantyClaimController::class, 'destroy']);
    });
    
    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/my/', [NotificationController::class, 'userNotifications']);
        Route::get('/unread-count/', [NotificationController::class, 'unreadCount']);
        Route::post('/', [NotificationController::class, 'store']);
        Route::get('/{notification}/', [NotificationController::class, 'show']);
        Route::post('/{notification}/read/', [NotificationController::class, 'markAsRead']);
    });
    
    // Admin Routes
    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('/metrics/', [AdminController::class, 'metrics']);
        Route::get('/dashboard/', [AdminController::class, 'dashboard']);
        Route::get('/activity/', [AdminController::class, 'activity']);
        Route::get('/audit/', [AdminController::class, 'activity']);
        Route::get('/users/stats/', [AdminController::class, 'userStats']);
        Route::get('/orders/stats/', [AdminController::class, 'orderStats']);
        Route::get('/warranties/stats/', [AdminController::class, 'warrantyStats']);
        Route::get('/trends/', [AdminController::class, 'trends']);
        Route::get('/export/{model}/', [AdminController::class, 'exportData']);
        
        // Role Management
        Route::prefix('roles')->group(function () {
            Route::get('/', [RoleController::class, 'index'])->middleware('backoffice.permission:SETTINGS,VIEW');
            Route::post('/', [RoleController::class, 'store'])->middleware('backoffice.permission:SETTINGS,UPDATE');
            Route::get('/{role}/', [RoleController::class, 'show'])->middleware('backoffice.permission:SETTINGS,VIEW');
            Route::put('/{role}/', [RoleController::class, 'update'])->middleware('backoffice.permission:SETTINGS,UPDATE');
            Route::delete('/{role}/', [RoleController::class, 'destroy'])->middleware('backoffice.permission:SETTINGS,UPDATE');
        });
        
        // Permission Management
        Route::prefix('permissions')->group(function () {
            Route::get('/', [PermissionController::class, 'index'])->middleware('backoffice.permission:SETTINGS,VIEW');
            Route::post('/', [PermissionController::class, 'store'])->middleware('backoffice.permission:SETTINGS,UPDATE');
            Route::put('/{permission}/', [PermissionController::class, 'update'])->middleware('backoffice.permission:SETTINGS,UPDATE');
            Route::delete('/{permission}/', [PermissionController::class, 'destroy'])->middleware('backoffice.permission:SETTINGS,UPDATE');
            Route::post('/bulk-assign/', [PermissionController::class, 'bulkAssign'])->middleware('backoffice.permission:SETTINGS,UPDATE');
        });
        
        // Staff User Management
        Route::prefix('staff')->group(function () {
            Route::get('/', [StaffUserController::class, 'index'])->middleware('backoffice.permission:USERS,VIEW');
            Route::post('/', [StaffUserController::class, 'store'])->middleware('backoffice.permission:USERS,ASSIGN');
            Route::get('/{staff}/', [StaffUserController::class, 'show'])->middleware('backoffice.permission:USERS,VIEW');
            Route::put('/{staff}/', [StaffUserController::class, 'update'])->middleware('backoffice.permission:USERS,ASSIGN');
            Route::delete('/{staff}/', [StaffUserController::class, 'destroy'])->middleware('backoffice.permission:USERS,ASSIGN');
        });
    });
});

// Generic JWT authenticated user route
Route::middleware('auth:jwt')->get('/user/', function (Request $request) {
    return $request->user();
});
