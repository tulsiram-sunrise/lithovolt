# Quick Diagnostic Guide

## 🔍 If You're Getting HTTP 500 Error

The artisan-commands.php script has an issue. Use the lightweight diagnostic script instead:

### Step 1: Upload Diagnostic Script

Upload to `backend-laravel/public/`
- ✅ `test-config.php` (lightweight, no Laravel required)

### Step 2: Access Diagnostic

Open in browser:
```
https://api.lithovolt.com.au/backend-laravel/public/test-config.php
```

OR if Laravel is in different location:
```
https://yourdomain.com/path/to/laravel/public/test-config.php
```

### Step 3: Read the JSON Output

You'll see a JSON response with:

**If SUCCESSFUL:**
```json
{
  "status": "SUCCESS",
  "detected_base_path": "/home/username/public_html/backend-laravel",
  "checks": {
    "one_level_up": {
      "vendor_exists": true
    }
  }
}
```

**Copy the detected_base_path value** - you'll need it for artisan-commands.php

---

**If NOT FOUND:**
```json
{
  "status": "VENDOR_NOT_FOUND",
  "message": "Could not find vendor/autoload.php",
  "solutions": [
    "Solution 1: Run composer install...",
    "In cPanel Terminal: cd /path/to/laravel && composer install"
  ]
}
```

---

### Step 4: Fix Based on Output

#### If vendor_exists = true

1. Copy the `"detected_base_path"` value
2. Edit `artisan-commands.php` 
3. Around line 52, SET:
   ```php
   $basePath = '/exact/path/from/json/output';
   ```
4. Save and upload the file

#### If vendor_exists = false

**Solution 1: Upload vendor folder**
- Download `backend-laravel/vendor/` from local machine
- Upload to server (large, may take time)
- OR

**Solution 2: Run composer on server**
- Contact hosting support:
  ```
  Subject: Please run composer install
  
  Can you run this command on my account?
  cd [path from test-config.php output]
  composer install
  ```
- OR use cPanel Terminal (if available):
  ```bash
  cd /home/username/public_html/backend-laravel
  composer install
  ```

---

## 📝 What test-config.php Checks

- PHP version
- Vendor folder location and status
- .env file location
- Bootstrap file location
- Directory permissions
- Memory limit
- All directories at different levels

---

## 🚀 After Fixing

1. Delete `test-config.php` (security risk)
2. Delete any old `artisan-commands.php` 
3. Upload NEW `artisan-commands.php` with correct $basePath
4. Upload `artisan-commands.html`
5. Access the HTML interface
6. Run CORS fix commands

---

## 💡 Example Output Analysis

```
detected_base_path: /home/abc123/public_html/backend-laravel
```

Then in artisan-commands.php, set:
```php
$basePath = '/home/abc123/public_html/backend-laravel';
```

---

**Your Password for artisan-commands.php:**
```
MySecure@Pass!2026#Litho#
```

Don't forget to change it to something only you know!
