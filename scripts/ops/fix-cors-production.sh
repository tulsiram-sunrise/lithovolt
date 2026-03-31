#!/bin/bash

# Fix CORS configuration on production server
# Run this script on your production server to fix common CORS issues

set -e

echo "=========================================="
echo "CORS Configuration Fix Script"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
LARAVEL_PATH="/var/www/backend-laravel"
FRONTEND_PATH="/var/www/lithovolt/frontend"
FRONTEND_DOMAIN="lithovolt.com.au"
BACKEND_DOMAIN="api.lithovolt.com.au"

echo -e "${YELLOW}Step 1: Checking directories...${NC}"
if [ ! -d "$LARAVEL_PATH" ]; then
    echo -e "${RED}❌ Laravel path not found: $LARAVEL_PATH${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Laravel directory found${NC}"

if [ ! -d "$FRONTEND_PATH" ]; then
    echo -e "${RED}❌ Frontend path not found: $FRONTEND_PATH${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Frontend directory found${NC}"

echo ""
echo -e "${YELLOW}Step 2: Checking and fixing .env files...${NC}"

# Check and update Backend .env
echo "Checking $LARAVEL_PATH/.env..."
if [ ! -f "$LARAVEL_PATH/.env" ]; then
    echo -e "${RED}❌ .env not found${NC}"
    exit 1
fi

# Update or add CORS settings
if grep -q "CORS_MAX_AGE" "$LARAVEL_PATH/.env"; then
    echo "  Updating CORS_MAX_AGE..."
    sed -i 's/CORS_MAX_AGE=.*/CORS_MAX_AGE=86400/' "$LARAVEL_PATH/.env"
else
    echo "  Adding CORS_MAX_AGE..."
    echo "CORS_MAX_AGE=86400" >> "$LARAVEL_PATH/.env"
fi

# Ensure APP_ENV is production
if grep -q "APP_ENV=local" "$LARAVEL_PATH/.env"; then
    echo "  Changing APP_ENV from local to production..."
    sed -i 's/APP_ENV=.*/APP_ENV=production/' "$LARAVEL_PATH/.env"
fi

echo -e "${GREEN}✅ Backend .env updated${NC}"

# Check Frontend .env.production
echo "Checking $FRONTEND_PATH/.env.production..."
if [ ! -f "$FRONTEND_PATH/.env.production" ]; then
    echo -e "${RED}❌ .env.production not found${NC}"
    exit 1
fi

EXPECTED_URL="https://$BACKEND_DOMAIN/api"
if grep -q "VITE_API_URL=$EXPECTED_URL" "$FRONTEND_PATH/.env.production"; then
    echo -e "${GREEN}✅ Frontend API URL is correct${NC}"
else
    echo "  Updating VITE_API_URL to $EXPECTED_URL..."
    sed -i "s|VITE_API_URL=.*|VITE_API_URL=$EXPECTED_URL|" "$FRONTEND_PATH/.env.production"
    echo -e "${GREEN}✅ Frontend API URL updated${NC}"
fi

echo ""
echo -e "${YELLOW}Step 3: Clearing Laravel caches...${NC}"
cd "$LARAVEL_PATH"
php artisan config:clear
echo -e "${GREEN}✅ Config cleared${NC}"

php artisan config:cache
echo -e "${GREEN}✅ Config cached${NC}"

php artisan route:cache
echo -e "${GREEN}✅ Routes cached${NC}"

echo ""
echo -e "${YELLOW}Step 4: Checking CORS configuration file...${NC}"
if [ -f "$LARAVEL_PATH/config/cors.php" ]; then
    if grep -q "'allowed_origins'" "$LARAVEL_PATH/config/cors.php"; then
        echo -e "${GREEN}✅ CORS config file exists${NC}"
        
        # Verify production domains are in config
        if grep -q "https://$FRONTEND_DOMAIN" "$LARAVEL_PATH/config/cors.php"; then
            echo -e "${GREEN}✅ Frontend domain is in CORS config${NC}"
        else
            echo -e "${YELLOW}⚠️  Frontend domain not in CORS config - manual update needed${NC}"
        fi
    else
        echo -e "${RED}❌ CORS configuration looks incorrect${NC}"
    fi
else
    echo -e "${RED}❌ CORS config file not found${NC}"
fi

echo ""
echo -e "${YELLOW}Step 5: Reloading web server...${NC}"
if command -v nginx &> /dev/null; then
    echo "  Found Nginx, reloading..."
    sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx reloaded${NC}"
elif command -v apache2ctl &> /dev/null; then
    echo "  Found Apache, reloading..."
    sudo systemctl reload apache2
    echo -e "${GREEN}✅ Apache reloaded${NC}"
else
    echo -e "${YELLOW}⚠️  No web server found - manually reload${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ CORS Fix Complete!${NC}"
echo "=========================================="
echo ""
echo "💡 Quick Test:"
echo "  curl -I -H \"Origin: https://$FRONTEND_DOMAIN\" \\"
echo "    https://$BACKEND_DOMAIN/api/products"
echo ""
echo "  Should see: Access-Control-Allow-Origin: https://$FRONTEND_DOMAIN"
echo ""
