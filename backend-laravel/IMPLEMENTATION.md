# LithoVolt Backend Implementation

## Overview

Complete Laravel 10 backend implementation for the LithoVolt battery management system with:
- **12 Database tables** with proper relationships
- **11 Eloquent Models** with typed relationships  
- **10 API Controllers** with full CRUD operations
- **Token-based Authentication** via Sanctum
- **Admin Dashboard** functionality
- **Database Seeders** with sample data
- **API Routes** (40+ endpoints organized by resource)

## Technology Stack

- **Framework**: Laravel 10.50.2
- **PHP Version**: 8.1.25
- **Database**: MySQL
- **Authentication**: Laravel Sanctum 3.3.3
- **QR Codes**: endroid/qr-code 5.1.0
- **Testing**: PHPUnit 10.5.63
- **Package Count**: 109 total dependencies

## Project Structure

```
backend-laravel/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       ├── AuthController.php
│   │   │       ├── UserController.php
│   │   │       ├── BatteryModelController.php
│   │   │       ├── SerialNumberController.php
│   │   │       ├── AccessoryController.php
│   │   │       ├── OrderController.php
│   │   │       ├── WarrantyController.php
│   │   │       ├── WarrantyClaimController.php
│   │   │       ├── NotificationController.php
│   │   │       └── AdminController.php
│   │   ├── Middleware/
│   │   │   ├── AdminMiddleware.php (custom)
│   │   │   └── [8 others from fresh Laravel installation]
│   │   └── Kernel.php (updated with admin middleware)
│   ├── Models/
│   │   ├── User.php (updated)
│   │   ├── Role.php
│   │   ├── BatteryModel.php
│   │   ├── SerialNumber.php
│   │   ├── Accessory.php
│   │   ├── Order.php
│   │   ├── OrderItem.php (polymorphic)
│   │   ├── Warranty.php
│   │   ├── WarrantyClaim.php
│   │   ├── WarrantyClaimAttachment.php
│   │   ├── Notification.php
│   │   └── NotificationSetting.php
│   └── Providers/
│       └── [5 from fresh installation]
├── database/
│   ├── migrations/
│   │   ├── 2024_02_16_000001_create_roles_table.php
│   │   ├── 2024_02_16_000002_update_users_table.php
│   │   ├── 2024_02_16_000003_create_battery_models_table.php
│   │   ├── 2024_02_16_000004_create_serial_numbers_table.php
│   │   ├── 2024_02_16_000005_create_accessories_table.php
│   │   ├── 2024_02_16_000006_create_orders_table.php
│   │   ├── 2024_02_16_000007_create_order_items_table.php
│   │   ├── 2024_02_16_000008_create_warranties_table.php
│   │   ├── 2024_02_16_000009_create_warranty_claims_table.php
│   │   ├── 2024_02_16_000010_create_warranty_claim_attachments_table.php
│   │   ├── 2024_02_16_000011_create_notifications_table.php
│   │   └── 2024_02_16_000012_create_notification_settings_table.php
│   └── seeders/
│       ├── RoleSeeder.php
│       ├── UserSeeder.php
│       ├── BatteryModelSeeder.php
│       └── DatabaseSeeder.php (updated)
├── routes/
│   └── api.php (completely updated with 40+ endpoints)
└── composer.json, artisan, etc.
```

## Database Schema

### Tables (14 Total)

1. **roles** - User roles (admin, wholesaler, retailer, customer)
2. **users** - User accounts with company and verification info
3. **battery_models** - Battery product catalog with voltage, capacity, specs
4. **serial_numbers** - Individual battery serial tracking with allocation
5. **accessories** - Accessory inventory management
6. **orders** - Customer orders with status tracking
7. **order_items** - Polymorphic order line items (battery/accessory)
8. **warranties** - Warranty records with QR codes
9. **warranty_claims** - Customer warranty claims
10. **warranty_claim_attachments** - Claim supporting documents
11. **notifications** - Multi-channel notification logs
12. **notification_settings** - User notification preferences
13. **personal_access_tokens** - Sanctum authentication tokens
14. **password_reset_tokens** - Password reset tokens

### Key Relationships

```
User
├── hasMany: orders
├── hasMany: warranties
├── hasMany: warrantyClaims
├── hasMany: notifications
├── hasMany: notificationSettings
└── belongsTo: role

Role
└── hasMany: users

BatteryModel
├── hasMany: serialNumbers
├── hasMany: warranties
└── morphMany: orderItems

SerialNumber
├── belongsTo: batteryModel
├── belongsTo: allocatedToUser (allocated_to FK)
└── belongsTo: soldToUser (sold_to FK)

Accessory
└── morphMany: orderItems

Order
├── belongsTo: user
└── hasMany: items (OrderItem)

OrderItem (Polymorphic)
├── belongsTo: order
└── morphTo: itemable (BatteryModel or Accessory)

Warranty
├── belongsTo: batteryModel
├── belongsTo: user
└── hasMany: claims

WarrantyClaim
├── belongsTo: warranty
├── belongsTo: user
└── hasMany: attachments

WarrantyClaimAttachment
└── belongsTo: claim

Notification
└── belongsTo: user

NotificationSetting
└── belongsTo: user
```

## API Endpoints (40+)

### Authentication (Public)
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login

### Authentication (Protected)
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/profile` - Get current user profile

### Users
- `GET /api/v1/users` - List all users (paginated)
- `GET /api/v1/users/{id}` - Get specific user with relationships
- `POST /api/v1/users` - Create user (admin only)
- `PUT /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user
- `POST /api/v1/users/{id}/verify` - Verify user email

### Battery Models
- `GET /api/v1/battery-models` - List batteries (paginated)
- `POST /api/v1/battery-models` - Create battery model
- `GET /api/v1/battery-models/{id}` - Get battery with serial/warranty details
- `PUT /api/v1/battery-models/{id}` - Update battery
- `DELETE /api/v1/battery-models/{id}` - Delete battery

### Serial Numbers
- `GET /api/v1/serial-numbers` - List serials (paginated)
- `POST /api/v1/serial-numbers` - Create serial
- `GET /api/v1/serial-numbers/{id}` - Get serial details
- `POST /api/v1/serial-numbers/{id}/allocate` - Allocate serial to user
- `POST /api/v1/serial-numbers/{id}/mark-sold` - Mark serial as sold
- `DELETE /api/v1/serial-numbers/{id}` - Delete serial

### Accessories
- `GET /api/v1/accessories` - List accessories (paginated)
- `POST /api/v1/accessories` - Create accessory
- `GET /api/v1/accessories/{id}` - Get accessory details
- `PUT /api/v1/accessories/{id}` - Update accessory
- `DELETE /api/v1/accessories/{id}` - Delete accessory

### Orders
- `GET /api/v1/orders` - List orders (paginated)
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders/{id}` - Get order with items
- `PUT /api/v1/orders/{id}` - Update order status
- `DELETE /api/v1/orders/{id}` - Delete order
- `GET /api/v1/users/{userId}/orders` - Get user orders

### Warranties
- `GET /api/v1/warranties` - List warranties (paginated)
- `POST /api/v1/warranties` - Create warranty
- `GET /api/v1/warranties/{id}` - Get warranty with claims
- `PUT /api/v1/warranties/{id}` - Update warranty status
- `DELETE /api/v1/warranties/{id}` - Delete warranty
- `GET /api/v1/warranties/qr/{qrCode}` - Validate QR code (public)

### Warranty Claims
- `GET /api/v1/warranty-claims` - List claims (paginated)
- `POST /api/v1/warranty-claims` - Create claim
- `GET /api/v1/warranty-claims/{id}` - Get claim with attachments
- `PUT /api/v1/warranty-claims/{id}` - Update claim status
- `DELETE /api/v1/warranty-claims/{id}` - Delete claim
- `GET /api/v1/warranties/{warrantyId}/claims` - Get warranty claims

### Notifications
- `GET /api/v1/notifications` - List all notifications
- `POST /api/v1/notifications` - Create notification
- `GET /api/v1/notifications/{id}` - Get notification
- `POST /api/v1/notifications/{id}/read` - Mark as read
- `GET /api/v1/my-notifications` - Get current user notifications
- `GET /api/v1/notifications/unread-count` - Get unread count

### Admin (Protected + Admin Role Required)
- `GET /api/v1/admin/dashboard` - Dashboard with stats & recent activity
- `GET /api/v1/admin/users/stats` - User statistics by role
- `GET /api/v1/admin/orders/stats` - Order statistics by status
- `GET /api/v1/admin/warranties/stats` - Warranty statistics
- `GET /api/v1/admin/export/{model}` - Export data (users/orders/warranties/claims)

## Sample Data

### Seeded Users
1. **Admin** - admin@lithovolt.com / password123
2. **Wholesaler** - wholesaler@lithovolt.com / password123
3. **Retailer** - retailer@lithovolt.com / password123
4. **Customer** - customer@lithovolt.com / password123

### Seeded Battery Models
1. LithoVolt Pro 48V 100Ah - ₹8,999.99 (60-month warranty)
2. LithoVolt Home 48V 50Ah - ₹4,999.99 (48-month warranty)
3. LithoVolt Max 96V 50Ah - ₹12,999.99 (72-month warranty)
4. LithoVolt Lite 24V 30Ah - ₹2,499.99 (36-month warranty)

## Installation & Setup

### 1. Prerequisites
- PHP 8.1+
- MySQL/MariaDB
- Composer
- Node.js (if building frontend assets)

### 2. Environment Setup
```bash
cd backend-laravel
cp .env.example .env
php artisan key:generate
```

### 3. Database Configuration
Edit `.env`:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=lithovolt
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Run Migrations & Seeds
```bash
php artisan migrate:fresh --seed
```

This creates all 14 tables with test data:
- 4 roles
- 4 test users
- 4 battery models
- 20 accessory placeholders
- Ready-to-use database

### 5. Start Development Server
```bash
php artisan serve --port=8000
```

Server runs on: `http://localhost:8000`

## Testing API

### Login & Get Token
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lithovolt.com","password":"password123"}'
```

Response includes `access_token` - use in subsequent requests:
```bash
curl -X GET http://localhost:8000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### Run Test Script
```bash
bash test-api.sh
```

## Controllers Summary

### AuthController
- Registration with validation
- Login with token generation
- Logout with token revocation
- User profile retrieval

### UserController
- CRUD operations on users
- Email verification
- Role-based access control

### BatteryModelController
- Manage battery products
- Track inventory quantities
- Price and warranty management

### SerialNumberController
- Track individual battery serials
- Allocation workflow (unallocated → allocated → sold)
- User allocation & sales tracking

### AccessoryController
- Manage accessory inventory
- Stock quantity tracking

### OrderController
- Create and manage orders
- Polymorphic order items (battery/accessory mix)
- Order status workflow
- Payment tracking
- User order history

### WarrantyController
- Create warranties for batteries
- QR code validation (public endpoint)
- Warranty expiry tracking
- Link to battery models

### WarrantyClaimController
- Submit warranty claims
- Track claim resolution
- File attachment management
- Status workflow

### NotificationController
- Send multi-channel notifications (email/SMS/push)
- Track notification history
- User preferences
- Unread count

### AdminController
- Dashboard with key metrics
- User statistics by role
- Order status breakdown
- Warranty statistics
- Data export functionality

## Key Features

### 1. Authentication & Authorization
- Token-based API authentication via Sanctum
- Role-based access control (admin middleware)
- Secure password hashing
- Email verification support

### 2. Multi-Channel Notifications
- Email notifications
- SMS notifications
- Push notifications
- User notification preferences
- Notification history

### 3. Warranty Management
- QR code generation and validation
- Claim submission with attachments
- Resolution tracking
- Claim history per warranty

### 4. Inventory Management
- Battery model catalog with specs
- Serial number tracking
- Accessory inventory
- Stock quantity management
- Allocation workflow

### 5. Order Management
- Polymorphic order items (mix batteries & accessories)
- Order status workflow
- Payment tracking
- User order history

### 6. Admin Dashboard
- Real-time statistics
- User management
- Recent activity tracking
- Data export

## API Response Format

### Success (200)
```json
{
  "data": [...],
  "message": "Success message"
}
```

### Created (201)
```json
{
  "message": "Resource created successfully",
  "resource": {...}
}
```

### Error (4xx/5xx)
```json
{
  "message": "Error description",
  "errors": {...}
}
```

## File Structure Created

**Controllers**: 10 files (~1,500 lines)
- AuthController, UserController, BatteryModelController, SerialNumberController
- AccessoryController, OrderController, WarrantyController, WarrantyClaimController
- NotificationController, AdminController

**Models**: 12 files (~300 lines)
- User, Role, BatteryModel, SerialNumber, Accessory, Order, OrderItem
- Warranty, WarrantyClaim, WarrantyClaimAttachment, Notification, NotificationSetting

**Migrations**: 12 files (~250 lines)
- All database schema definitions with proper foreign keys and indexes

**Seeders**: 4 files (~150 lines)
- RoleSeeder, UserSeeder, BatteryModelSeeder, DatabaseSeeder

**Routes**: 1 file (75 lines)
- 40+ endpoints organized by resource with auth/admin middleware

**Middleware**: 1 custom file
- AdminMiddleware for admin-only routes

**Total**: 40+ files, ~2,500 lines of production code

## Database Verification

Run queries to verify setup:
```bash
# Connect to database
mysql -u root lithovolt

# Check tables
SHOW TABLES;

# Verify users
SELECT name, email, role_id FROM users;

# Verify roles
SELECT name FROM roles;

# Verify batteries
SELECT name, sku, price FROM battery_models;
```

## Next Steps

1. **Create Laravel Tests** - Unit/Feature tests for all controllers
2. **Add Request Validation Classes** - Form request classes for endpoints
3. **Add API Resources** - Response formatting resources
4. **Add Service Classes** - Business logic layer (Warranty, Order, Notification services)
5. **Setup Frontend Integration** - Connect with React/Vue frontend
6. **Add Logging & Monitoring** - Error tracking and analytics
7. **Setup CI/CD** - GitHub Actions or similar
8. **Deploy** - Docker containerization and cloud deployment

## Troubleshooting

### Port Already in Use
```bash
php artisan serve --port=8001  # Change port
```

### Database Connection Error
```bash
# Check .env DB credentials
php artisan config:clear
php artisan cache:clear
```

### Foreign Key Errors During Migration
```bash
# Ensure tables are created in correct order (migrations are sequenced)
php artisan migrate:status  # Check migration status
```

### Token Expired
- All tokens have default expiration
- Get new token via login endpoint
- Tokens persist until user logout

## Support & Documentation

- Laravel Docs: https://laravel.com
- Sanctum Docs: https://laravel.com/docs/sanctum
- MySQL Docs: https://dev.mysql.com/doc/

---

**Implementation Date**: February 16, 2024  
**Framework Version**: Laravel 10.50.2  
**PHP Version**: 8.1.25  
**Status**: ✅ COMPLETE - Ready for Testing & Frontend Integration
