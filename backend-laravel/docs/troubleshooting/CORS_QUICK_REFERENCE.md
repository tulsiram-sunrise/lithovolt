# CORS Setup Summary - Backend-Laravel

## ✅ Completed Configuration

### 1. **config/cors.php** - Updated
- ✅ Specific allowed origins (development & production)
- ✅ Credentials support enabled
- ✅ Security headers configured
- ✅ Environment-based max_age setting

### 2. **.env.example** - Updated
- ✅ Added CORS_MAX_AGE variable
- ✅ Documentation for dev/production settings

### 3. **app/Http/Kernel.php** - Already Configured
- ✅ HandleCors middleware already registered globally

---

## Quick Start

### Development Setup

1. **Copy .env file:**
   ```bash
   cp .env.example .env
   ```

2. **Add to .env:**
   ```env
   CORS_MAX_AGE=0
   ```

3. **Start Laravel:**
   ```bash
   php artisan serve
   ```

### Production Setup

1. **Create .env on server:**
   ```env
   # Set production values
   APP_ENV=production
   APP_DEBUG=false
   CORS_MAX_AGE=86400
   ```

2. **Clear cache:**
   ```bash
   php artisan config:cache
   php artisan route:cache
   ```

---

## Allowed Origins

### Development
- `http://localhost:3000` (React dev)
- `http://localhost:5173` (Vite dev)
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`

### Production
- `https://lithovolt.com.au`
- `https://www.lithovolt.com.au`

---

## Testing CORS

**In browser console:**
```javascript
// Test API connection
fetch('https://api.lithovolt.com.au/api/products')
  .then(r => r.json())
  .then(data => console.log('✅ CORS working:', data))
  .catch(error => console.error('❌ CORS Error:', error))
```

**Check response headers (DevTools → Network tab):**
```
Access-Control-Allow-Origin: https://lithovolt.com.au
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
Access-Control-Allow-Credentials: true
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "CORS policy blocked request" | Add frontend domain to `config/cors.php` allowed_origins |
| "Method not allowed" | Check HTTP method is in allowed_methods |
| "Header not allowed" | Add custom header to allowed_headers |
| Cache still blocking | Run `php artisan config:clear` |

---

## Updated Files
- [config/cors.php](../../config/cors.php)
- [.env.example](.e.example)
- [CORS_SETUP.md](CORS_SETUP.md) - Detailed documentation

---

**Status:** ✅ CORS configured and ready for deployment
