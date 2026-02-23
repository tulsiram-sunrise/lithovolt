# CORS Headers Not Being Sent - Fix Guide

## 🔴 Problem
API returns 200 OK but **NO CORS headers** in response:
- ❌ No `Access-Control-Allow-Origin`
- ❌ No `Access-Control-Allow-Methods`
- ❌ No `Access-Control-Allow-Credentials`

This means **CORS middleware isn't running**.

---

## 🔍 Diagnose the Issue

### Step 1: Check Middleware Status

Upload & access:
```
https://api.lithovolt.com.au/check-cors-middleware.php
```

This will tell you **exactly** what's wrong.

---

## ⚠️ Most Common Issue: Bootstrap Cache

**This is usually the culprit!**

Laravel caches the bootstrap files. If this cache exists, it may prevent new configuration from being loaded.

### Fix: Delete Bootstrap Cache

Via cPanel File Manager:

1. Navigate to: `/home/lithovolt/lithovolt-api/bootstrap/cache/`
2. Delete ALL files in this directory:
   - `app.php` (if exists)
   - `config.php` (if exists)
   - `packages.php` (if exists)
   - Any other files
3. **Keep the directory itself** - don't delete `cache/` folder

### Via artisan-commands.php:

Unfortunately you can't run Artisan commands to clear bootstrap cache without SSH. That's why we delete manually.

---

## 🛠️ Other Possible Fixes

### Issue 1: HandleCors Not in Global Middleware

**Check:** Does `check-cors-middleware.php` show `handlecors_in_global_list: false`?

**Fix:** Edit `/lithovolt-api/app/Http/Kernel.php`

Find:
```php
protected $middleware = [
    // other middleware
];
```

Make sure it includes:
```php
protected $middleware = [
    \App\Http\Middleware\TrustProxies::class,
    \Illuminate\Http\Middleware\HandleCors::class,  ← Must be here!
    // ... other middleware
];
```

Save and delete bootstrap cache (see above).

---

### Issue 2: Config Cache is Stale

**Check:** Does `check-cors-middleware.php` show `config_cache_exists: true`?

**If yes:** Delete the config cache

Via cPanel File Manager:
1. Navigate to: `/home/lithovolt/lithovolt-api/bootstrap/cache/`
2. Delete: `config.php`

Then run via artisan-commands.php:
```
config:cache
```

---

## ✅ Step-by-Step Fix

### 1. Upload diagnostic script
```
check-cors-middleware.php → public_html/backend-laravel/public/
```

### 2. Run diagnostic
```
https://api.lithovolt.com.au/check-cors-middleware.php
```

### 3. Follow the solutions provided

The JSON output will tell you **exactly** what to do.

### 4. Delete bootstrap cache (Usually the fix!)
```
Delete: /lithovolt-api/bootstrap/cache/*
```

### 5. Clear Laravel caches via artisan-commands.php
```
Access: https://api.lithovolt.com.au/artisan-commands.php
Password: MySecure@Pass!2026#Litho#

Run:
- config:clear
- config:cache
- route:cache
- optimize:clear
```

### 6. Test login again
```
Go to: https://lithovolt.com.au
Try login
Check DevTools Network → Response Headers for CORS headers
```

---

## 🎯 Most Likely Solution

**99% of the time, the fix is:**

1. Delete all files in `/lithovolt-api/bootstrap/cache/`
2. Run `config:clear` and `config:cache` via artisan-commands.php
3. Test login

**Try this first before investigating further!**

---

## 📋 Quick Checklist

- [ ] Uploaded check-cors-middleware.php
- [ ] Ran the diagnostic and got JSON output
- [ ] Read the issues and solutions
- [ ] Deleted bootstrap cache files
- [ ] Ran config:clear via artisan-commands.php
- [ ] Ran config:cache via artisan-commands.php
- [ ] Ran route:cache via artisan-commands.php
- [ ] Ran optimize:clear via artisan-commands.php
- [ ] Tested login on frontend
- [ ] Checked DevTools for CORS headers

---

## 🆘 Still Not Working?

Share the output of:
```
https://api.lithovolt.com.au/check-cors-middleware.php
```

I'll identify the exact issue and fix it!
