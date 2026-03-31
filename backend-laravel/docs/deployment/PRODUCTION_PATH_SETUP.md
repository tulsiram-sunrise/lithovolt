# Production Path Setup - lithovolt-api Location

## 🎯 Your Exact Structure

On your **production server**, Laravel is at:

```
/public_html/
├── backend-laravel/
│   └── public/  ← (diagnostic scripts here)
│       ├── check-path.php
│       ├── auto-detect-laravel.php
│       ├── verify-cors-setup.php
│       ├── cors-debug.php
│       ├── artisan-commands.php
│       └── test-config.php
│
└── lithovolt-api/  ← (actual Laravel root!)
    ├── config/
    │   └── cors.php  (CORS configuration)
    ├── app/
    ├── .env  (environment variables)
    ├── vendor/
    ├── artisan
    └── composer.json
```

**From the script location**:
```
/public_html/backend-laravel/public/
    ↓ go up 2 levels
/public_html/
    ↓ enter lithovolt-api
/public_html/lithovolt-api/  ← Laravel root!
```

**Equivalent to**: `../../lithovolt-api` from the scripts!

---

## 🚀 Quick Setup: 4 Steps

### **Step 1: Upload Diagnostic Scripts**

Upload these to `public_html/backend-laravel/public/`:

1. ✅ **check-path.php** (NEW - tests exact path)
2. ✅ **auto-detect-laravel.php** (UPDATED - tries known path first)
3. ✅ **verify-cors-setup.php** (UPDATED - uses ../../lithovolt-api)
4. ✅ **cors-debug.php** (UPDATED - uses ../../lithovolt-api)
5. ✅ **artisan-commands.php** (UPDATED - uses ../../lithovolt-api)

---

### **Step 2: Verify Path Detection**

Access in browser:
```
https://api.lithovolt.com.au/check-path.php
```

**Expected output:**
```json
{
  "laravel_root": "/home/xyz/public_html/lithovolt-api",
  "laravel_files_at_path": {
    "artisan": "✅ YES",
    "composer.json": "✅ YES",
    "config/cors.php": "✅ YES",
    ".env": "✅ YES"
  },
  "status": "SUCCESS - Laravel found at correct path!"
}
```

**If all show ✅** → **Path detection works!**

---

### **Step 3: Verify CORS Configuration**

Access:
```
https://api.lithovolt.com.au/verify-cors-setup.php
```

Should show:
- ✅ config/cors.php found
- ✅ .env file found
- ✅ All required settings present
- ✅ Issues found: 0

---

### **Step 4: Run Cache Commands**

Access:
```
https://api.lithovolt.com.au/artisan-commands.php
```

Password: `MySecure@Pass!2026#Litho#`

Run in this order:
```
1. config:clear    ← Clear all caches
2. config:cache    ← Cache new config
3. route:cache     ← Cache routes
4. optimize:clear  ← Clear everything
```

Wait for ✅ after each command.

---

## 🧪 Complete Testing Workflow

### Verify Path (Most Important First!)
```
Access: https://api.lithovolt.com.au/check-path.php
Expected: All Laravel files marked ✅ YES
Problem?: Check your directory structure on cPanel
```

### Verify CORS Setup
```
Access: https://api.lithovolt.com.au/verify-cors-setup.php
Expected: Issues found = 0
Problem?: See detailed error messages in JSON output
```

### Debug CORS Headers
```
Access: https://api.lithovolt.com.au/cors-debug.php
Check:
  - "detected_laravel_root" shows correct path
  - "origin_sent" shows https://lithovolt.com.au
  - "is_in_allowed_list" shows true
```

### Run Cache Commands
```
Access: https://api.lithovolt.com.au/artisan-commands.php
Password: MySecure@Pass!2026#Litho#
Run: config:clear → config:cache → route:cache → optimize:clear
Expected: All show ✅ success
```

### Test Frontend Login
```
Go to: https://lithovolt.com.au
Open DevTools: F12 → Network tab
Try login
Click failed request
Check Response Headers for:
  ✅ Access-Control-Allow-Origin: https://lithovolt.com.au
  ✅ Access-Control-Allow-Methods: GET, POST, ...
  ✅ Access-Control-Allow-Credentials: true
```

---

## 🔧 Troubleshooting by Error

### ❌ ERROR: "Laravel files not found at ../../lithovolt-api"

**Check:**
```
Does /public_html/ contain:
  ✅ backend-laravel/ directory
  ✅ lithovolt-api/ directory
```

If not, your directory structure is different. Run `check-path.php` and share the output.

---

### ❌ ERROR: "config/cors.php not found"

**Cause:** config/cors.php missing from /public_html/lithovolt-api/config/

**Fix:**
1. Get file from your local repo: `backend-laravel/config/cors.php`
2. Upload to cPanel: `public_html/lithovolt-api/config/cors.php`
3. Re-run verify-cors-setup.php

---

### ❌ ERROR: ".env not found or not readable"

**Cause:** .env missing from /public_html/lithovolt-api/

**Fix:**
1. Edit or create: `public_html/lithovolt-api/.env`
2. Ensure it has production values:
   ```
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://api.lithovolt.com.au
   CORS_MAX_AGE=86400
   DB_HOST=localhost
   DB_DATABASE=lithovolt_db
   DB_USERNAME=lithovolt_user
   DB_PASSWORD=d[(1WHC~DiaZtP4%
   ```
3. Save and run: `config:cache`

---

### ❌ ERROR: "Artisan command failed / command not found"

**Causes:**
1. Base path not detected (check check-path.php output)
2. Wrong password on artisan-commands.php
3. vendor/autoload.php missing

**Quick fix:**
1. Verify vendor exists: `/public_html/lithovolt-api/vendor/`
2. If missing, contact hosting to run: `composer install`

---

## 📋 Files to Upload

| File | Location | Purpose |
|------|----------|---------|
| check-path.php | public_html/backend-laravel/public/ | Test path detection |
| verify-cors-setup.php | public_html/backend-laravel/public/ | Verify CORS config |
| cors-debug.php | public_html/backend-laravel/public/ | Debug CORS headers |
| artisan-commands.php | public_html/backend-laravel/public/ | Run artisan commands |
| auto-detect-laravel.php | public_html/backend-laravel/public/ | Auto-detect Laravel |

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ `check-path.php` shows all Laravel files with ✅ YES
2. ✅ `verify-cors-setup.php` shows Issues found: 0
3. ✅ `artisan-commands.php` commands all return success ✅
4. ✅ `cors-debug.php` shows correct origin and allowed list
5. ✅ Frontend can login without CORS errors
6. ✅ DevTools shows Access-Control-Allow-Origin header

---

## 🎯 Next Action: Upload Files & Test Path

1. Upload **check-path.php** to `public_html/backend-laravel/public/`
2. Access: **https://api.lithovolt.com.au/check-path.php**
3. **Share the JSON output** with me

This will confirm your exact directory structure and guide the next steps! 🚀
