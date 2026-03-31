# cPanel Deployment Guide - Complete Setup

## Understanding cPanel Directory Structure

### Typical cPanel Setup

```
/home/username/
├── public_html/              ← Web accessible (http/https)
│   ├── index.php
│   ├── .htaccess
│   ├── assets/
│   └── backend-laravel/      ← Your Laravel app (OPTION A)
│       ├── public/
│       ├── app/
│       ├── config/
│       └── vendor/           ← Inside public_html ✅ Script can access
│
└── backup-laravel/           ← Above web root (OPTION B)
    ├── public/
    ├── app/
    ├── config/
    └── vendor/               ← Outside public_html ❌ Script cannot access via web
```

---

## OPTION A: Laravel Inside public_html (RECOMMENDED FOR CPANEL)

This is the **easiest** for shared hosting like cPanel.

### Step 1: Upload Structure

Upload your files like this:

```
/home/username/public_html/
├── index.php                    ← Points to backend-laravel/public/index.php
├── .htaccess                    ← Configured for Laravel routing
├── backend-laravel/
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/
│   │   ├── index.php
│   │   ├── artisan-commands.php    ← ✅ CAN access ../vendor
│   │   └── artisan-commands.html
│   ├── routes/
│   ├── storage/
│   ├── vendor/                 ← ✅ Accessible
│   └── .env
```

### Step 2: Update artisan-commands.php

The script needs to find vendor correctly:

```php
<?php
/**
 * Laravel Artisan Commands - cPanel Version (Public inside public_html)
 */

// Get the Laravel base path
// In cPanel: /home/username/public_html/backend-laravel/
$basePath = dirname(dirname(__DIR__));  // Go up from public/ to backend-laravel/

// Verify paths exist
if (!file_exists($basePath . '/vendor/autoload.php')) {
    die(json_encode([
        'status' => 'error',
        'message' => 'Cannot find vendor/autoload.php',
        'checked_path' => $basePath . '/vendor/autoload.php',
        'current_dir' => __DIR__,
        'base_path' => $basePath
    ]));
}

// Rest of the script...
```

### Step 3: Fix public/index.php

Your main `public/index.php` should point correctly:

```php
<?php
// In /home/username/public_html/backend-laravel/public/index.php

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';

// ... rest of Laravel bootstrap
```

---

## OPTION B: Laravel Outside public_html (Advanced)

If your Laravel is at `/home/username/backend-laravel/` (above public_html):

### Step 1: Directory Structure

```
/home/username/
├── public_html/
│   ├── index.php              ← Symlink or include script
│   ├── .htaccess
│   └── (mostly empty)
│
└── backend-laravel/           ← Outside web root
    ├── public/
    │   ├── index.php
    │   └── artisan-commands.php   ← ⚠️  Hard to access via browser
    ├── vendor/
    └── .env
```

### Step 2: Problem with This Setup

❌ **Problem:** The `artisan-commands.php` script is outside `public_html`, so you can't access it via `https://domain.com/path`

### Step 3: Solutions for Option B

**Solution 1: Create a Wrapper Script in public_html**

Create `/home/username/public_html/run-command.php`:

```php
<?php
/**
 * Wrapper script in public_html to access Laravel outside public_html
 * 
 * Location: /home/username/public_html/run-command.php
 * Access: https://domain.com/run-command.php
 */

$PASSWORD = 'your-secure-password';
$password = $_GET['pwd'] ?? null;

if ($password !== $PASSWORD) {
    http_response_code(401);
    die(json_encode(['status' => 'error', 'message' => 'Unauthorized']));
}

$command = $_GET['cmd'] ?? null;

// The Laravel path is ABOVE public_html
$basePath = dirname(dirname(__DIR__)) . '/backend-laravel';

// Verify vendor exists
if (!file_exists($basePath . '/vendor/autoload.php')) {
    die(json_encode([
        'status' => 'error',
        'message' => 'Cannot find Laravel installation',
        'checked_path' => $basePath
    ]));
}

require_once $basePath . '/vendor/autoload.php';
$app = require_once $basePath . '/bootstrap/app.php';

// ... rest of artisan execution code
```

**Solution 2: Create public_html/backend-laravel-public Symlink**

```bash
# SSH (if available) OR cPanel Terminal
cd /home/username/public_html
ln -s ../backend-laravel/public backend-laravel-public

# Then access at: https://domain.com/backend-laravel-public/artisan-commands.php
```

**Solution 3: Move Laravel Inside public_html**

Simplest solution - upload Laravel inside public_html and use OPTION A structure.

---

## Recommended cPanel Setup (EASIEST)

### Structure:
```
/home/username/public_html/
├── api/                        ← Backend API
│   ├── app/
│   ├── config/
│   ├── public/                 ← Points to https://domain.com/
│   │   ├── index.php
│   │   ├── .htaccess
│   │   ├── artisan-commands.php
│   │   └── artisan-commands.html
│   ├── vendor/
│   └── .env
│
└── index.html                  ← Frontend (static files)
    (served by .htaccess)
```

### How It Works:

**Frontend:** `https://lithovolt.com.au/` 
- Serves from: `/home/username/public_html/index.html` + static files

**Backend API:** `https://api.lithovolt.com.au/`
- If on same server via subdomain
- Points to: `/home/username/public_html/api/public/`
- Or use separate cPanel addon domain

---

## Deployment Checklist for cPanel

### Step 1: Verify Current Structure
```bash
# In cPanel Terminal, run:
ls -la ~/public_html/
ls -la ~/public_html/backend-laravel/vendor/

# Should see vendor folder
# If vendor is empty, run: cd ~/public_html/backend-laravel && composer install
```

### Step 2: Check PHP Version
```bash
php -v
# Should be PHP 8.1+ 
# Check in cPanel: Select PHP version if needed
```

### Step 3: Set .env File

Edit `/home/username/public_html/backend-laravel/.env`:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.lithovolt.com.au

# If on same server with different subdomain:
# APP_URL=https://lithovolt.com.au/api

DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=cpanel_username_dbname
DB_USERNAME=cpanel_username_dbuser
DB_PASSWORD=your_password

CORS_MAX_AGE=86400
```

### Step 4: Set File Permissions

In cPanel File Manager:

1. Select all files in `backend-laravel/`
2. Right-click → **Set Permissions**
3. Directories: `755`
4. Files: `644`
5. `storage/` directory: `755`
6. `bootstrap/cache/` directory: `755`

### Step 5: Update artisan-commands.php

Update the password line:

```php
$PASSWORD = 'YourSecurePassword123!@#';
```

### Step 6: Upload Files

Upload to: `/home/username/public_html/backend-laravel/public/`

- `artisan-commands.php`
- `artisan-commands.html`

### Step 7: Test Access

Open: `https://yourdomain.com/backend-laravel/public/artisan-commands.html`

Or adjust URL based on your actual cPanel structure.

### Step 8: Run Commands

1. Enter password
2. Click command buttons
3. Watch output

### Step 9: Delete Files

After fixing:

1. Go to cPanel File Manager
2. Navigate to: `backend-laravel/public/`
3. Delete: `artisan-commands.php`
4. Delete: `artisan-commands.html`

---

## How to Find Your cPanel Structure

### Method 1: cPanel File Manager

1. Log in to cPanel
2. Click **File Manager**
3. You'll see the directory structure
4. Look for `public_html` folder
5. See if Laravel is inside or outside

### Method 2: Terminal (if available)

```bash
# SSH or cPanel Terminal
cd ~
ls -la
ls -la public_html/
ls -la public_html/backend-laravel/  # Or wherever Laravel is
```

### Method 3: Contact Hosting Support

Email: `your-hosting-support@host.com`

```
Subject: What is my Laravel installation path?

Body:
I have Laravel installed on my cPanel account.
Can you tell me the exact file path?

Example: /home/username/public_html/backend-laravel/
or: /home/username/backend-laravel/

Thank you
```

---

## Common cPanel Issues & Fixes

### Issue 1: "Cannot find vendor/autoload.php"

**Cause:** Laravel files not uploaded or composer not run

**Fix:**
```bash
# In cPanel Terminal:
cd ~/public_html/backend-laravel
composer install
```

### Issue 2: artisan-commands.php Shows Blank Page

**Cause:** PHP version doesn't support syntax, or wrong path

**Fix:**
1. Check file has no syntax errors (paste in editor)
2. Verify paths are correct
3. Check permissions (644 for files)

### Issue 3: artisan-commands.html Won't Load

**Cause:** File type not served

**Fix:**
1. Verify file was uploaded as `.html` (not `.txt`)
2. Check file permissions (644)
3. Try accessing directly: `https://domain.com/path/artisan-commands.html`

### Issue 4: Commands Fail - "File not found"

**Cause:** Path doesn't match actual directory structure

**Fix:**
- Edit `artisan-commands.php`
- Change `$basePath` to match your actual cPanel path
- Example: `$basePath = '/home/username/public_html/backend-laravel';`

---

## Summary: What You Need

**Before deploying to cPanel:**

1. ✅ Know your exact directory structure
2. ✅ Ensure `vendor/` is in the right place
3. ✅ Update `artisan-commands.php` with correct paths
4. ✅ Set strong password
5. ✅ Upload both `.php` and `.html` files
6. ✅ Set correct file permissions (644)
7. ✅ Access via browser
8. ✅ Run CORS fix commands
9. ✅ DELETE the files after use

---

## Files to Check/Update

On your cPanel account, these need to be correct:

1. **`backend-laravel/.env`**
   - `APP_ENV=production`
   - `CORS_MAX_AGE=86400`

2. **`backend-laravel/config/cors.php`**
   - `allowed_origins` has your domains

3. **`backend-laravel/public/artisan-commands.php`**
   - Password is strong and unique
   - Paths point to correct `vendor/`

4. **File Permissions**
   - Directories: `755`
   - Files: `644`
   - `storage/`: `755`

---

**What's your current cPanel structure?**

Tell me:
- Is Laravel inside or outside `public_html`?
- What's the exact folder path? (e.g., `public_html/backend-laravel/`)
- Is `vendor/` folder present and populated?

Then I can give exact commands/paths for your setup! 🎯
