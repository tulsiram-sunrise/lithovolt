# CORS Configuration Guide - Laravel Backend

## Overview
Cross-Origin Resource Sharing (CORS) allows your frontend to communicate with the Laravel backend API from different domains. This guide covers configuring CORS for both development and production environments.

---

## Configuration Files

### 1. **config/cors.php** (Main Configuration)
This file controls all CORS settings. It has been updated with:
- ✅ Specific allowed origins (not wildcards)
- ✅ Security headers configuration
- ✅ Credentials support enabled
- ✅ Environment-based max_age setting

### 2. **.env** (Environment Variables)
Add CORS settings to your `.env` file:

```env
# Development (0 = no caching)
CORS_MAX_AGE=0

# Production (86400 = 24 hours caching)
CORS_MAX_AGE=86400
```

---

## Setup Instructions

### Step 1: Copy .env File

```bash
cd backend-laravel

# Copy the example file
cp .env.example .env

# Or update your existing .env
```

### Step 2: Configure Allowed Origins

Edit `config/cors.php` and update the `allowed_origins` array:

#### **For Development:**
```php
'allowed_origins' => [
    'http://localhost:3000',      // React dev server (port 3000)
    'http://localhost:5173',      // Vite dev server
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
],
```

#### **For Production:**
```php
'allowed_origins' => [
    'https://lithovolt.com.au',
    'https://www.lithovolt.com.au',
],
```

#### **For Both (Recommended - use .env):**
Keep the config file with all possible origins and control via `.env`:

```php
// In config/cors.php
'allowed_origins' => array_filter([
    // Development
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    
    // Production
    env('APP_URL'),  // Gets from .env
    'https://lithovolt.com.au',
    'https://www.lithovolt.com.au',
]),
```

### Step 3: Set Environment Variables

#### **Development .env:**
```dotenv
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
CORS_MAX_AGE=0
```

#### **Production .env:**
```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.lithovolt.com.au
CORS_MAX_AGE=86400
```

### Step 4: Verify Middleware Installation

Check that `fruitcake/laravel-cors` middleware is installed:

```bash
# Should be in composer.json
grep "fruitcake/laravel-cors" composer.json

# If not installed:
composer require fruitcake/laravel-cors
```

### Step 5: Register Middleware in Bootstrap

Check `bootstrap/app.php` has CORS middleware:

```php
// bootstrap/app.php
return Application::configure(basePath: dirname(__DIR__))
    // ... other configuration ...
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(append: [
            \Fruitcake\Cors\HandleCors::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
```

---

## CORS Response Headers

Once configured, your API will automatically respond with these headers:

```
Access-Control-Allow-Origin: https://lithovolt.com.au
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Accept, Origin, X-Requested-With, X-CSRF-Token
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

---

## Testing CORS Configuration

### Test 1: Simple GET Request
```bash
# From frontend (browser console)
fetch('https://api.lithovolt.com.au/api/products')
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(error => console.error('CORS Error:', error))
```

### Test 2: With Authentication
```bash
# Test endpoints that require JWT token
fetch('https://api.lithovolt.com.au/api/admin/products', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json',
  }
})
.then(r => r.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error))
```

### Test 3: Check Response Headers (DevTools)
1. Open browser DevTools (F12)
2. Go to Network tab
3. Make an API request
4. Click the request and inspect Response Headers
5. Should see `Access-Control-Allow-Origin: https://lithovolt.com.au`

---

## Common CORS Errors & Solutions

### Error: "Access to XMLHttpRequest has been blocked by CORS policy"

**Cause:** Frontend origin not in allowed_origins

**Solution:**
1. Check frontend URL in browser address bar
2. Add it to `config/cors.php` allowed_origins
3. Clear browser cache
4. Restart Laravel server

### Error: "Method not allowed in CORS"

**Cause:** HTTP method not in allowed_methods

**Solution:**
```php
// In config/cors.php - ensure method is listed
'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
```

### Error: "Header not allowed by CORS"

**Cause:** Custom header not in allowed_headers

**Solution:**
```php
// Add custom header to allowed_headers
'allowed_headers' => [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With',
    'X-CSRF-Token',
    'Your-Custom-Header', // Add here
],
```

---

## Security Considerations

### ✅ Do This:
- ✅ Use specific domain origins (not `*`)
- ✅ Use HTTPS in production
- ✅ Set `supports_credentials = true` for JWT auth
- ✅ Limit allowed methods to what's needed
- ✅ Set max_age appropriately

### ❌ Don't Do This:
- ❌ Use `'allowed_origins' => ['*']` in production
- ❌ Leave `APP_DEBUG=true` in production
- ❌ Expose sensitive headers unnecessarily
- ❌ Allow credentials with widely-open origins

---

## Deployment Checklist

### Before Production Deployment:

- [ ] Create production `.env` file with correct settings
- [ ] Update `config/cors.php` with production domains only:
  ```php
  'allowed_origins' => [
      'https://lithovolt.com.au',
      'https://www.lithovolt.com.au',
  ]
  ```
- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Set `CORS_MAX_AGE=86400` (24 hours)
- [ ] Set `APP_URL=https://api.lithovolt.com.au`
- [ ] Run `php artisan config:cache`
- [ ] Run `php artisan route:cache`
- [ ] Test from production frontend domain
- [ ] Monitor error logs for CORS issues

### Staging Environment:

- [ ] Create staging `.env` for testing
- [ ] Include staging domain: `https://staging.lithovolt.com.au`
- [ ] Set `APP_DEBUG=true` (for debugging)
- [ ] Set `CORS_MAX_AGE=0` (no caching during testing)

---

## Environment-Specific Configuration

### Development (.env)
```dotenv
APP_ENV=local
APP_DEBUG=true
CORS_MAX_AGE=0
```

### Staging (.env.staging)
```dotenv
APP_ENV=staging
APP_DEBUG=true
CORS_MAX_AGE=3600
```

### Production (.env.production)
```dotenv
APP_ENV=production
APP_DEBUG=false
CORS_MAX_AGE=86400
```

---

## Quick Reference

| Setting | Development | Production |
|---------|-------------|-----------|
| Allowed Origins | localhost:3000, localhost:5173 | lithovolt.com.au, www.lithovolt.com.au |
| APP_ENV | local | production |
| APP_DEBUG | true | false |
| CORS_MAX_AGE | 0 | 86400 |
| Credentials | true | true |

---

## Related Files

- [config/cors.php](config/cors.php) - Main CORS configuration
- [.env.example](.env.example) - Environment variables template
- [routes/api.php](routes/api.php) - API routes

---

## Support

For issues with CORS configuration, check:
1. Browser DevTools Network tab for response headers
2. Laravel error logs: `storage/logs/laravel.log`
3. `.env` file matches your environment
4. Frontend domain exactly matches allowed_origins

