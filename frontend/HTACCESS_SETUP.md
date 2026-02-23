# .htaccess Configuration for Frontend Deployment

## Overview

The `.htaccess` file is essential for deploying a React/Vite SPA (Single Page Application) on Apache servers. It handles URL routing, compression, caching, and security.

## What Does .htaccess Do?

### 1. **SPA Routing** (Most Important)
```
RewriteRule ^ index.html [QSA,L]
```
- Routes all requests to `index.html`
- Allows React Router to handle all client-side routing
- Without this, direct URL access would result in 404 errors

### 2. **Compression**
```
AddOutputFilterByType DEFLATE text/javascript
AddOutputFilterByType DEFLATE application/javascript
AddOutputFilterByType DEFLATE text/css
```
- Compresses CSS, JS, HTML files (GZIP)
- Reduces file sizes by 50-70%
- Faster page loads

### 3. **Browser Caching**
```
ExpiresByType text/html "access plus 1 hour"
ExpiresByType application/javascript "access plus 1 year"
ExpiresByType text/css "access plus 1 year"
```
- HTML files checked hourly (frequent updates)
- JS/CSS files cached for 1 year (hashed names from Vite)
- Images and fonts cached for 1 year

### 4. **Security Headers**
```
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-XSS-Protection "1; mode=block"
```
- Prevents MIME type sniffing
- Prevents clickjacking attacks
- Enables XSS protection

## Build Process

The `.htaccess` file is **automatically copied to the dist folder** during the build process:

```bash
npm run build
# This runs: vite build && node scripts/copy-htaccess.js
```

### What Happens:
1. ✅ Vite builds your React app → creates `dist/` folder
2. ✅ `copy-htaccess.js` copies `.htaccess` to `dist/`
3. ✅ Final output includes `dist/.htaccess`

## Deployment Steps

### Step 1: Build Locally
```bash
cd frontend
npm run build
```

Check that `.htaccess` is in the dist folder:
```bash
ls -la dist/.htaccess
```

### Step 2: Upload to Server
```bash
# Upload entire dist folder to web root
scp -r dist/* user@server:/var/www/lithovolt/

# Verify .htaccess is present on server
ssh user@server "ls -la /var/www/lithovolt/.htaccess"
```

### Step 3: Verify Apache Configuration

On your server, ensure:

1. **Apache modules enabled:**
   ```bash
   sudo a2enmod rewrite
   sudo a2enmod deflate
   sudo a2enmod expires
   sudo a2enmod headers
   sudo systemctl restart apache2
   ```

2. **Directory permissions:**
   ```bash
   chmod 644 /var/www/lithovolt/.htaccess
   chown www-data:www-data /var/www/lithovolt/.htaccess
   ```

3. **VirtualHost allows .htaccess:**
   ```apache
   <Directory /var/www/lithovolt>
       AllowOverride All
       Require all granted
   </Directory>
   ```

## Testing

### Test 1: Check Compression
```bash
curl -I -H "Accept-Encoding: gzip" https://lithovolt.com.au/index.html
# Should see: Content-Encoding: gzip
```

### Test 2: Check Caching Headers
```bash
curl -I https://lithovolt.com.au/assets/main.*.js
# Should see: Cache-Control: max-age=31536000 (1 year)
```

### Test 3: Test SPA Routing
```bash
# Direct URLs should work (not 404)
curl -I https://lithovolt.com.au/admin/dashboard
curl -I https://lithovolt.com.au/wholesaler/orders
```

### Test 4: Check Security Headers
```bash
curl -I https://lithovolt.com.au
# Should see:
# X-Content-Type-Options: nosniff
# X-Frame-Options: SAMEORIGIN
# X-XSS-Protection: 1; mode=block
```

## Troubleshooting

### Issue: 404 Not Found on Direct URLs

**Symptom:** `https://lithovolt.com.au/admin/dashboard` returns 404

**Cause:** `.htaccess` not present or not being read

**Solution:**
1. Verify `.htaccess` exists in web root:
   ```bash
   ls -la /var/www/lithovolt/.htaccess
   ```

2. Check Apache error logs:
   ```bash
   tail -f /var/log/apache2/error.log
   ```

3. Verify `mod_rewrite` is enabled:
   ```bash
   sudo a2enmod rewrite && sudo systemctl restart apache2
   ```

### Issue: Files Not Compressing

**Symptom:** No `Content-Encoding: gzip` header

**Cause:** `mod_deflate` not enabled

**Solution:**
```bash
sudo a2enmod deflate
sudo systemctl restart apache2
```

### Issue: Changes Not Visible

**Symptom:** Old version still showing after deployment

**Cause:** Browser caching

**Solution:**
```bash
# Clear browser cache manually
# Or add cache-busting query param in links
# Vite handles this with hashed filenames automatically
```

## File Structure After Build

```
dist/
├── index.html                 # Main entry point
├── .htaccess                  # ✅ Apache configuration (auto-copied)
├── assets/
│   ├── main.HASH.js          # Bundled JS (cached 1 year)
│   ├── main.HASH.css         # Bundled CSS (cached 1 year)
│   ├── vendor.HASH.js        # Third-party JS (cached 1 year)
│   └── images/
│       └── *.HASH.ext        # Images (cached 1 year)
└── vite.svg                   # Static assets
```

## Advanced Configuration

### Nginx Alternative
If using Nginx instead of Apache, use this instead of .htaccess:

```nginx
location / {
    try_files $uri $uri/ /index.html;
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}

location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Custom Rules
Add custom rules to `.htaccess` as needed:

```apache
# Example: Block access to specific paths
RewriteRule ^\.env /index.html [L]
RewriteRule ^config /index.html [L]

# Example: Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## Files Included

- [.htaccess](../.htaccess) - Apache configuration
- [scripts/copy-htaccess.js](../scripts/copy-htaccess.js) - Copy script (Node.js)
- [scripts/copy-htaccess.sh](../scripts/copy-htaccess.sh) - Copy script (Linux/Mac)
- [scripts/copy-htaccess.bat](../scripts/copy-htaccess.bat) - Copy script (Windows)

## Related Documentation

- [README.md](../README.md) - Frontend setup guide
- [vite.config.js](../vite.config.js) - Vite configuration
- [package.json](../package.json) - Build scripts

## Quick Reference

| Task | Command |
|------|---------|
| Build locally | `npm run build` |
| Check .htaccess in dist | `ls dist/.htaccess` |
| Deploy to server | `scp -r dist/* user@server:/var/www/lithovolt/` |
| Enable mod_rewrite | `sudo a2enmod rewrite && sudo systemctl restart apache2` |
| Test compression | `curl -I -H "Accept-Encoding: gzip" https://lithovolt.com.au` |
| Test routing | `curl -I https://lithovolt.com.au/admin/dashboard` |

---

**Status:** ✅ .htaccess automatically included in production builds
**Last Updated:** Feb 23, 2026
