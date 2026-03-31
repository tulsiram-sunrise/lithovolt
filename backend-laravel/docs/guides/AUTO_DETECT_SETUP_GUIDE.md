# Auto-Detecting CORS Setup Guide

## 🎯 What Changed

The diagnostic scripts now **automatically find your Laravel installation**, even if it's in the parent directory!

```
Old method (broken):  Script looks for ../config/cors.php
New method (working): Script finds Laravel root, then looks for config/cors.php
```

---

## 📋 Quick Setup: 3 Steps

### **Step 1: Upload These Files to `public_html/backend-laravel/public/`**

Using cPanel File Manager:

1. **auto-detect-laravel.php** ← For testing path detection
2. **verify-cors-setup.php** ← Comprehensive CORS verification (updated)
3. **cors-debug.php** ← CORS origin debugging (updated)
4. **artisan-commands.php** ← Web-based artisan runner (updated with password)
5. **test-config.php** ← Basic config check

---

### **Step 2: Test Path Detection**

Access in browser:
```
https://api.lithovolt.com.au/auto-detect-laravel.php
```

You should see JSON output showing:
```json
{
  "detected_laravel_root": "/path/to/backend-laravel",
  "files_found": {
    "config/cors.php": true/false,
    ".env": true/false,
    "artisan": true/false
  }
}
```

**If all are `true` ✅** → Path detection works!
**If any are `false` ❌** → Keep reading...

---

### **Step 3: Verify Full CORS Setup**

Access:
```
https://api.lithovolt.com.au/verify-cors-setup.php
```

This will show:
- ✅ Is config/cors.php found?
- ✅ What's in .env (APP_ENV, APP_DEBUG, etc)?
- ✅ Is Kernel.php configured correctly?
- ✅ Issues found and how to fix them

---

## 🔥 What to Do Based on Auto-Detection Results

### **Case 1: Everything Found ✅**

Files detected:
```
config/cors.php ✅
.env ✅
artisan ✅
app/Http/Kernel.php ✅
```

**Do this:**
1. Access `artisan-commands.php`
   - Password: `MySecure@Pass!2026#Litho#`
   - Verify by running: `config:clear`

2. Run these commands in order:
   ```
   config:clear
   config:cache
   route:cache
   optimize:clear
   ```

3. Test login on https://lithovolt.com.au
4. Check DevTools Network tab for CORS headers

---

### **Case 2: config/cors.php Not Found ❌**

**You need to upload it!**

From your local machine:
- File: `backend-laravel/config/cors.php`
- Upload to: `public_html/backend-laravel/config/`

After uploading, run artisan commands to cache it.

---

### **Case 3: .env Not Found or Wrong ❌**

**Update .env on server:**

Via cPanel File Manager or FTP:
1. Navigate to `public_html/backend-laravel/`
2. Edit `.env` directly

Make sure it has:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.lithovolt.com.au
CORS_MAX_AGE=86400
DB_HOST=localhost
DB_DATABASE=lithovolt_db
DB_USERNAME=lithovolt_user
DB_PASSWORD=d[(1WHC~DiaZtP4%
```

After changes, run artisan commands to reload.

---

### **Case 4: Kernel.php Missing HandleCors ❌**

**This shouldn't happen**, but if it does:

Edit `app/Http/Kernel.php`:

Find:
```php
protected $middleware = [
```

Make sure it includes:
```php
\Illuminate\Http\Middleware\HandleCors::class,
```

---

## 🧪 Testing Step-by-Step

### 1️⃣ Check if Laravel paths are detected
```
Access: https://api.lithovolt.com.au/auto-detect-laravel.php
Expected: All files found = true
```

### 2️⃣ Check CORS configuration
```
Access: https://api.lithovolt.com.au/verify-cors-setup.php
Expected: Issues found = 0
```

### 3️⃣ Check what origin is being sent
```
Access: https://api.lithovolt.com.au/cors-debug.php
Look for: "origin_sent" field
Should show: https://lithovolt.com.au
```

### 4️⃣ Run cache commands
```
Access: https://api.lithovolt.com.au/artisan-commands.php
Password: MySecure@Pass!2026#Litho#

Run:
- config:clear ✅
- config:cache ✅
- route:cache ✅
- optimize:clear ✅
```

### 5️⃣ Test frontend login
```
Go to: https://lithovolt.com.au
Try login
Open DevTools (F12) → Network tab
Click failed request
Check Response Headers for:
- Access-Control-Allow-Origin
- Access-Control-Allow-Methods
- Access-Control-Allow-Credentials
```

---

## 🆘 Troubleshooting

### **Problem: Auto-detection shows `false` for Laravel root**

**Cause:** Script can't find artisan, composer.json, or app directory

**Solution:** 
Check your directory structure using cPanel File Manager:

```
Does /public_html/backend-laravel/ contain:
  ✅ artisan (file)
  ✅ composer.json (file)
  ✅ app/ (directory)
  ✅ config/ (directory)
  ✅ .env (file)
  ✅ public/ (directory) ← This is where scripts are
```

If not, you might have uploaded files incorrectly.

---

### **Problem: Artisan commands say "command not executed"**

**Causes:**
1. Password wrong (must be exactly: `MySecure@Pass!2026#Litho#`)
2. Base path not detected (check auto-detect-laravel.php output)
3. PHP can't run shell commands (rare on cPanel)

**Solution:**
1. Verify password matches exactly
2. Check auto-detect output
3. Try a simpler command: `list`

---

### **Problem: Scripts show config/cors.php doesn't exist**

**Fix:**

1. Upload file from local: `backend-laravel/config/cors.php`
2. Upload to: `public_html/backend-laravel/config/`
3. Make sure it's in correct directory (not public/config/)

After upload, run: `config:cache`

---

## 🎯 Next Steps

1. **Upload auto-detect-laravel.php** → https://api.lithovolt.com.au/auto-detect-laravel.php
   - Check output to see if paths are found

2. **Upload verify-cors-setup.php** → https://api.lithovolt.com.au/verify-cors-setup.php
   - Check output to see what's missing

3. **Share both outputs with me** → I'll tell you exactly what to fix

4. **Once fixed:**
   - Run artisan commands
   - Test frontend login
   - Verify CORS headers in DevTools

---

**Ready to test? Start with auto-detect-laravel.php!** 🚀
