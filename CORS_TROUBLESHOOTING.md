# CORS Error Troubleshooting Guide

## Quick Diagnosis Steps

### Step 1: Check the Exact Error Message
Open browser DevTools (F12) → **Console** tab and look for the error message like:

```
Access to XMLHttpRequest at 'https://api.lithovolt.com.au/api/auth/login/' 
from origin 'https://lithovolt.com.au' 
has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
The value of the 'Access-Control-Allow-Origin' header in the response 
must be 'https://lithovolt.com.au' or '*'
```

**Share this error message** - it tells us exactly what's wrong.

---

### Step 2: Check Network Response Headers
1. Open **DevTools → Network tab**
2. Make an API request (e.g., try logging in)
3. Click on the failed request
4. Go to **Response Headers** section
5. Look for these headers:

```
Access-Control-Allow-Origin: ???
Access-Control-Allow-Methods: ???
Access-Control-Allow-Headers: ???
```

**Share what you see** (or if they're missing)

---

### Step 3: Verify URLs Match

Check these on your production server:

#### Frontend URL (from browser):
```
https://lithovolt.com.au
```

#### Backend API URL (from frontend .env.production):
```
VITE_API_URL=https://api.lithovolt.com.au/api
```

#### Backend server address:
```
https://api.lithovolt.com.au
```

**All three should match the production domain**

---

## Common CORS Issues & Fixes

### Issue 1: Frontend and Backend on Different Domains

**Error:** `Access-Control-Allow-Origin: missing`

**Check:**
```bash
# On production server
cat /var/www/lithovolt/frontend/.env.production
# Should show: VITE_API_URL=https://api.lithovolt.com.au/api

cat /var/www/backend-laravel/.env
# Should show: APP_URL=https://api.lithovolt.com.au
```

**Fix:** Update `config/cors.php` to include frontend domain:
```php
'allowed_origins' => [
    'https://lithovolt.com.au',
    'https://www.lithovolt.com.au',
],
```

---

### Issue 2: Missing /api Path

**Error:** 404 or endpoint not found

**Check:**
```bash
# Verify frontend uses correct API URL
cat /var/www/lithovolt/frontend/.env.production
# Must be: VITE_API_URL=https://api.lithovolt.com.au/api
# NOT:     VITE_API_URL=https://api.lithovolt.com.au
```

**Fix:**
```bash
# On production server
echo "VITE_API_URL=https://api.lithovolt.com.au/api" > /var/www/lithovolt/frontend/.env.production
# Rebuild frontend
cd /var/www/lithovolt/frontend
npm run build
```

---

### Issue 3: CORS Config Not Updated

**Error:** `Access-Control-Allow-Origin: *` (wildcard in production)

**Check:**
```bash
# On production, verify CORS config
grep -A 10 "allowed_origins" /var/www/backend-laravel/config/cors.php
```

**Fix:** Update `config/cors.php`:
```php
'allowed_origins' => [
    'https://lithovolt.com.au',
    'https://www.lithovolt.com.au',
],
```

Then clear cache:
```bash
cd /var/www/backend-laravel
php artisan config:clear
php artisan config:cache
```

---

### Issue 4: Laravel Not Recognizing CORS Middleware

**Error:** CORS headers completely missing from response

**Check:**
```bash
# Verify middleware is enabled
grep -i "cors\|handlecors" /var/www/backend-laravel/app/Http/Kernel.php
```

**Fix:** Ensure middleware is in Kernel.php:
```php
protected $middleware = [
    \Illuminate\Http\Middleware\HandleCors::class,  // ← Add this
    // ... other middleware
];
```

Then:
```bash
cd /var/www/backend-laravel
php artisan config:cache
php artisan route:cache
```

---

### Issue 5: CORS_MAX_AGE Not Set in .env

**Error:** Caching issues or inconsistent behavior

**Check:**
```bash
# On production server
grep CORS_MAX_AGE /var/www/backend-laravel/.env
```

**Fix:**
```bash
# Add to .env
echo "CORS_MAX_AGE=86400" >> /var/www/backend-laravel/.env
cd /var/www/backend-laravel
php artisan config:clear
```

---

## Verification Checklist

Run these commands on your production server to verify:

### 1. Check Frontend Environment
```bash
cat /var/www/lithovolt/frontend/.env.production
# Output should show:
# VITE_API_URL=https://api.lithovolt.com.au/api
# VITE_APP_NAME=Lithovolt Battery Management
```

### 2. Check Backend Environment
```bash
cat /var/www/backend-laravel/.env | grep -E "APP_URL|CORS|APP_ENV"
# Output should show:
# APP_ENV=production
# APP_URL=https://api.lithovolt.com.au
# CORS_MAX_AGE=86400
```

### 3. Verify CORS Configuration
```bash
# Check config file
grep -A 15 "'allowed_origins'" /var/www/backend-laravel/config/cors.php
# Should list your production domains
```

### 4. Test API from Browser Console
```javascript
// In browser console at https://lithovolt.com.au
fetch('https://api.lithovolt.com.au/api/products')
  .then(r => {
    console.log('Status:', r.status);
    console.log('Headers:', r.headers);
    return r.json();
  })
  .then(data => console.log('Data:', data))
  .catch(e => console.error('Error:', e));
```

### 5. Check Response Headers with curl
```bash
curl -I -H "Origin: https://lithovolt.com.au" \
  https://api.lithovolt.com.au/api/auth/login/
# Should show Access-Control-Allow-Origin header
```

---

## Step-by-Step Fix (if still broken)

### Step 1: SSH to Server
```bash
ssh user@your-server-ip
cd /var/www/backend-laravel
```

### Step 2: Update CORS Configuration
```bash
# Create/update production CORS config
cat > config/cors.php << 'EOF'
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],

    'allowed_origins' => [
        'https://lithovolt.com.au',
        'https://www.lithovolt.com.au',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => [
        'Content-Type',
        'Authorization',
        'Accept',
        'Origin',
        'X-Requested-With',
        'X-CSRF-Token',
    ],

    'exposed_headers' => [
        'Content-Type',
        'Authorization',
    ],

    'max_age' => 86400,

    'supports_credentials' => true,
];
EOF
```

### Step 3: Clear Caches
```bash
php artisan config:clear
php artisan config:cache
php artisan route:cache
```

### Step 4: Reload Web Server
```bash
# If using Nginx
sudo systemctl reload nginx

# If using Apache
sudo systemctl reload apache2
```

### Step 5: Test
```bash
# From local machine
curl -I -H "Origin: https://lithovolt.com.au" \
  https://api.lithovolt.com.au/api/products

# Should see:
# Access-Control-Allow-Origin: https://lithovolt.com.au
```

---

## Test with curl Command

Run this on your local machine:

```bash
# Test preflight OPTIONS request
curl -v -X OPTIONS \
  -H "Origin: https://lithovolt.com.au" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  https://api.lithovolt.com.au/api/auth/login/

# Should return:
# Access-Control-Allow-Origin: https://lithovolt.com.au
# Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
# Access-Control-Allow-Headers: Content-Type, Authorization, Accept, Origin, X-Requested-With, X-CSRF-Token
```

---

## Information to Share

To help you debug, please provide:

1. **Exact error message** from browser console
2. **API response headers** (from DevTools → Network → Response Headers)
3. **Frontend domain:** (e.g., https://lithovolt.com.au)
4. **Backend domain:** (e.g., https://api.lithovolt.com.au)
5. **Output of these commands on server:**
   ```bash
   cat /var/www/lithovolt/frontend/.env.production
   cat /var/www/backend-laravel/.env | head -20
   ```

---

## Quick Fix Summary

Most CORS issues are caused by:
1. ❌ Frontend and backend on different domains (✅ must be configured in cors.php)
2. ❌ Missing `/api` in VITE_API_URL (✅ must be included)
3. ❌ CORS config not cleared (✅ run config:clear)
4. ❌ Frontend .env not rebuilt (✅ must rebuild after env change)

---

**Status:** Ready to diagnose - please share error details
