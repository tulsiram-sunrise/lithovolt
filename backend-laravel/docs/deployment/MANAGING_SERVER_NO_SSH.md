# Managing Production Server Without SSH Access

## Option 1: Web-Based Artisan Commands (Recommended & Easiest)

### Setup (One-time)

1. **Upload these files to your server:**
   - `public/artisan-commands.php`
   - `public/artisan-commands.html`

2. **Set a strong password** in `artisan-commands.php`:
   ```php
   $PASSWORD = 'your-very-secure-password-here';  // ← Change this
   ```

3. **Access via browser:**
   ```
   https://api.lithovolt.com.au/artisan-commands.html
   ```

### How to Use

1. Open the URL above in your browser
2. Enter your admin password
3. Click on a preset command OR select from dropdown
4. Click "Execute Selected Command"
5. Wait for output
6. ✅ Done!

### Available Commands

**Quick Fix for CORS:**
- Clear Config Cache
- Cache Config
- Cache Routes
- Clear Optimization

**Other Commands:**
- Clear Application Cache
- Clear View Cache
- Restart Queue
- Run Migrations
- Run Seeders

### IMPORTANT: Delete After Use

```bash
# Remove these files after you're done
rm public/artisan-commands.php
rm public/artisan-commands.html
```

**Do this via FTP or File Manager in cPanel!**

---

## Option 2: Using cPanel (if available)

### Via File Manager

1. Log in to cPanel
2. Go to **File Manager**
3. Navigate to `backend-laravel/` folder
4. Create a new file: `reset-cache.php`
5. Add this content:

```php
<?php
// Quick cache reset (no password needed for cPanel)
$commands = [
    'config:clear',
    'config:cache',
    'route:cache',
];

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);

foreach ($commands as $cmd) {
    echo "Running: $cmd<br>";
    $kernel->call($cmd);
    echo "✅ Done<br>";
}

echo "<br>All caches cleared!";
?>
```

6. Access via: `https://api.lithovolt.com.au/reset-cache.php`
7. Delete the file after use via File Manager

---

## Option 3: Using FTP/SFTP (File Transfer)

If you have FTP/SFTP access but not SSH:

### Upload Modified .env

1. Download `.env` from server via FTP
2. Edit locally:
   ```env
   APP_DEBUG=false
   CORS_MAX_AGE=86400
   ```
3. Upload back to server

### Clear Caches via PHP Script

1. Create `public/clear-cache.php`:
```php
<?php
// Minimal cache clearance script
$commands = ['config:clear', 'config:cache', 'route:cache'];
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
foreach ($commands as $cmd) {
    $app->make('Illuminate\Contracts\Console\Kernel')->call($cmd);
}
echo "Caches cleared";
?>
```

2. Upload via FTP
3. Visit: `https://api.lithovolt.com.au/public/clear-cache.php`
4. Delete via FTP

---

## Option 4: Using Hosting Control Panel

### GoDaddy / Bluehost / SiteGround

1. Log in to your hosting control panel
2. Find "Terminal" or "SSH" option
3. If terminal available, use it like SSH
4. If not available, look for:
   - **Database Manager** - reset DB
   - **File Manager** - edit files
   - **Email/Support** - contact support to run commands

### Contact Support

If you don't have access to any of above:

**Email Hosting Support:**
```
Subject: Please run these Laravel commands for CORS fix

Body:
Please run these commands on my hosting account for lithovolt.com.au:

1. cd /home/username/public_html/backend-laravel
2. php artisan config:clear
3. php artisan config:cache
4. php artisan route:cache

This will fix CORS configuration issues.
Thank you,
Your Name
```

---

## Option 5: Running Commands Locally (Not Ideal)

If you have Laravel installed locally:

```bash
# SSH tunnel to get direct database access
# Then run commands locally (only if you trust the sync)

# NOT RECOMMENDED - can cause sync issues
```

---

## CORS Fix Steps (Without SSH)

### Step 1: Edit Config File

1. **Via FTP:**
   - Download: `backend-laravel/config/cors.php`
   - Edit locally
   - Upload back

   Change from:
   ```php
   'allowed_origins' => ['*'],
   ```
   
   To:
   ```php
   'allowed_origins' => [
       'https://lithovolt.com.au',
       'https://www.lithovolt.com.au',
   ],
   ```

### Step 2: Edit .env File

1. **Via FTP or cPanel File Manager:**
   - Download: `backend-laravel/.env`
   - Edit:
     ```env
     APP_ENV=production
     CORS_MAX_AGE=86400
     ```
   - Upload back

### Step 3: Clear Caches

**Option A: Web-Based Script** (Easiest)
- Upload `artisan-commands.html` + `.php`
- Use web interface (see Option 1 above)

**Option B: cPanel Terminal**
- Go to cPanel → Terminal (if available)
- Run: `php artisan config:clear && php artisan config:cache`

**Option C: Contact Support**
- Email hosting provider
- Ask them to run: `php artisan config:cache`

### Step 4: Reload Web Server

Usually automatic, but if not:
- Use cPanel → "Restart Services"
- Or email support

---

## Quick Reference: Methods by Hosting Provider

| Hosting | SSH | FTP | cPanel Terminal | Has Web Terminal |
|---------|-----|-----|-----------------|-----------------|
| AWS EC2 | ✅ | ❌ | N/A | ✅ Allow in security group |
| DigitalOcean | ✅ | ❌ | N/A | ✅ Console |
| Heroku | ✅ | ❌ | N/A | ✅ CLI |
| GoDaddy | ❌ | ✅ | ❌ | ✅ (pay extra) |
| Bluehost | ❌ | ✅ | ✅ | ✅ |
| SiteGround | ❌ | ✅ | ✅ | ✅ |
| A2 Hosting | ✅ | ✅ | ✅ | ✅ |

---

## Testing After Fix

### Via Browser Console

Go to `https://lithovolt.com.au` and open DevTools (F12):

```javascript
// Test API connection
fetch('https://api.lithovolt.com.au/api/products')
  .then(r => {
    console.log('Headers:', r.headers);
    return r.json();
  })
  .then(data => console.log('✅ Success:', data))
  .catch(e => console.error('❌ Error:', e));
```

### Via Online curl Tool

Use: https://reqbin.com/

Request:
```
GET https://api.lithovolt.com.au/api/products
Header: Origin: https://lithovolt.com.au
```

Look for `Access-Control-Allow-Origin` in response.

---

## Troubleshooting Without SSH

### Problem: Can't Upload Files via FTP

**Solution:**
1. Use WebFTP in cPanel
2. Use File Manager in control panel
3. Contact hosting support

### Problem: artisan-commands.html Shows Blank Page

**Solution:**
1. Verify PHP version supports the script
2. Check file permissions (should be 644)
3. Check `.php` file is in same directory as `.html`

### Problem: Password Not Working

**Solution:**
1. Password is case-sensitive
2. Check special characters are entered correctly
3. Verify you edited the `.php` file correctly
4. Try different browsers/incognito mode

### Problem: Still Getting CORS Error After Fix

**Solution:**
1. Verify both files were uploaded (config/cors.php and .env)
2. Verify changes were saved
3. Clear browser cache: Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
4. Wait 5-10 minutes for caches to expire
5. Try hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

---

## Security Best Practices

### DO:
- ✅ Use a STRONG password (30+ characters with special chars)
- ✅ Delete scripts after use
- ✅ Use HTTPS only (never HTTP)
- ✅ Limit access to your IP (if possible)

### DON'T:
- ❌ Leave scripts on server permanently
- ❌ Use simple passwords
- ❌ Share password in emails
- ❌ Commit these files to git

---

## Files Provided

- `public/artisan-commands.php` - Executes artisan commands
- `public/artisan-commands.html` - Web interface (user-friendly)

---

## Support Resources

If stuck:
1. Contact your hosting provider support
2. Ask them to run: `php artisan config:cache`
3. Share CORS error details
4. Provide your domain names

---

**Status:** Ready to manage server without SSH ✅
