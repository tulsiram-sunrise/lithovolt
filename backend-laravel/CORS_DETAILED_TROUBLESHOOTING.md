# CORS Issue - Detailed Troubleshooting

## 🔍 **Step 1: Check What Origin Frontend is Sending**

Your frontend is at: `https://lithovolt.com.au`

Go to DevTools (F12) → **Console** and run:
```javascript
console.log('My origin:', window.location.origin);
```

**You should see:** `https://lithovolt.com.au`

Share this value with me ⬅️ **Important!**

---

## 🔧 **Step 2: Run CORS Debug Script**

Upload to `backend-laravel/public/`:
- `cors-debug.php`

Access:
```
https://api.lithovolt.com.au/cors-debug.php
```

You'll get JSON output showing:
```json
{
  "request": {
    "origin": "???"  // What origin the browser sent
  },
  "cors_config_file": {
    "allowed_origins": [...]  // What's in your config
  },
  "checks": {
    "origin_check": {
      "is_in_allowed_list": true/false  // ✅ or ❌
    }
  }
}
```

**Share this output with me** - it shows the exact problem!

---

## 🎯 **Common CORS Issues & Fixes**

### Issue 1: Origin Not in allowed_origins

**Error:** `is_in_allowed_list: false`

**Fix:**

1. SSH/cPanel Terminal:
   ```bash
   cd /home/username/public_html/backend-laravel
   ```

2. Edit `config/cors.php`:
   ```bash
   nano config/cors.php
   ```

3. Find:
   ```php
   'allowed_origins' => [
       'https://lithovolt.com.au',
       'https://www.lithovolt.com.au',
   ],
   ```

4. Make sure it includes your EXACT domain (from cors-debug.php output)

5. Save: `Ctrl+X` → `Y` → `Enter`

6. Clear caches:
   ```bash
   php artisan config:clear
   php artisan config:cache
   ```

---

### Issue 2: CORS Config Not Found

**Error:** `"exists": false`

**Fix:**

Make sure file exists at: `backend-laravel/config/cors.php`

If missing, run:
```bash
cd backend-laravel
composer require fruitcake/laravel-cors
```

---

### Issue 3: Env Variables Not Set

**Error:** App shows `app_env: null` or wrong value

**Fix:**

1. Edit `.env`:
   ```bash
   nano .env
   ```

2. Verify these are set:
   ```env
   APP_ENV=production
   APP_DEBUG=false
   CORS_MAX_AGE=86400
   ```

3. Save and clear caches:
   ```bash
   php artisan config:clear
   php artisan config:cache
   ```

---

## 🧪 **Step-by-Step Debugging**

### 1. Get Your Exact Origin

In browser console at `https://lithovolt.com.au`:
```javascript
console.log(window.location.origin);
```

**Copy the output** - example: `https://lithovolt.com.au`

### 2. Check CORS Config has Your Origin

On server, edit `config/cors.php`:
```php
'allowed_origins' => [
    'https://lithovolt.com.au',        // ← Must match exactly
    'https://www.lithovolt.com.au',
],
```

### 3. Check .env is Correct

```env
APP_ENV=production
CORS_MAX_AGE=86400
```

### 4. Clear All Caches

```bash
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan optimize:clear
```

### 5. Test with cors-debug.php

Access: `https://api.lithovolt.com.au/cors-debug.php`

Should show: `"is_in_allowed_list": true`

### 6. Test Login on Frontend

Go to `https://lithovolt.com.au`

Try to login - should work now ✅

---

## 📊 **What CORS Response Should Look Like**

In DevTools → Network tab, click on failed request:

**Response Headers should include:**
```
Access-Control-Allow-Origin: https://lithovolt.com.au
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Accept, Origin, X-Requested-With, X-CSRF-Token
Access-Control-Allow-Credentials: true
```

If any of these are missing, CORS will fail.

---

## 🚀 **Quickest Fix (If You Want)**

Run these commands on server:

```bash
cd /path/to/backend-laravel

# 1. Edit config
sed -i "s/'allowed_origins' => \[\*\],/'allowed_origins' => [\n        'https:\/\/lithovolt.com.au',\n        'https:\/\/www.lithovolt.com.au',\n    ],/" config/cors.php

# 2. Clear caches
php artisan config:clear
php artisan config:cache
php artisan route:cache
```

---

## 💡 **Information I Need**

To help you, please share:

1. **Your frontend domain:** (e.g., `https://lithovolt.com.au`)
2. **Your backend domain:** (e.g., `https://api.lithovolt.com.au`)
3. **Output of cors-debug.php** (paste the JSON)
4. **Exact error message** from browser (F12 Console)
5. **Content of config/cors.php** (allowed_origins section)

---

## ✅ **Verification Checklist**

After making changes:

- [ ] Edited `config/cors.php` with YOUR domain
- [ ] Edited `.env` with `APP_ENV=production` and `CORS_MAX_AGE=86400`
- [ ] Ran `php artisan config:clear && php artisan config:cache`
- [ ] Ran `php artisan route:cache`
- [ ] Restarted web server (nginx/apache)
- [ ] Cleared browser cache (Ctrl+Shift+Delete)
- [ ] Tested with cors-debug.php
- [ ] Tested login on frontend
- [ ] Deleted all debug scripts

---

**Next: Run cors-debug.php and share the output!** 🎯
