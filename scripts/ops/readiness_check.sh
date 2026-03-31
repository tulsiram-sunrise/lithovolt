#!/bin/bash

# Comprehensive Readiness Check for Frontend, Mobile, Laravel
# Skips Django backend (on hold)

echo "======================================"
echo "LITHOVOLT READINESS CHECK"
echo "======================================"
echo "Scope: Frontend | Mobile | Laravel"
echo "Date: $(date)"
echo ""

PASS=0
FAIL=0

test_component() {
    local name=$1
    local cmd=$2
    echo -n "Testing $name ... "
    if eval "$cmd" > /dev/null 2>&1; then
        echo "✅ PASS"
        ((PASS++))
    else
        echo "❌ FAIL"
        ((FAIL++))
    fi
}

# Frontend checks
echo ""
echo "📦 FRONTEND (React + Vite)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_component "npm installed" "npm --version"
cd frontend && test_component "node_modules exist" "[ -d node_modules ]" && cd ..
cd frontend && test_component "package.json valid" "npm list --depth=0 | grep -q lithovolt-frontend" && cd ..
cd frontend && test_component "can build" "npm run build --version > /dev/null 2>&1" && cd ..

# Mobile checks
echo ""
echo "📱 MOBILE (React Native + Expo)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_component "Expo CLI available" "npx expo --version"
cd mobile && test_component "node_modules exist" "[ -d node_modules ]" && cd ..
cd mobile && test_component "package.json valid" "npm list --depth=0 | grep -q lithovolt-mobile" && cd ..
cd mobile && test_component "expo-doctor installed" "[ -f node_modules/.bin/expo-doctor ]" && cd ..
cd mobile && test_component "Expo Doctor checks" "npx expo-doctor > /dev/null 2>&1" && cd ..

# Laravel checks
echo ""
echo "🔧 LARAVEL BACKEND"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_component "PHP installed" "php --version"
test_component "Composer installed" "composer --version"
cd backend-laravel && test_component "vendor dir exists" "[ -d vendor ]" && cd ..
cd backend-laravel && test_component "composer.json valid" "composer validate --quiet" && cd ..
cd backend-laravel && test_component "migrations exist" "find database/migrations -name '*.php' | wc -l | grep -qE '[1-9]'" && cd ..

# Integration checks
echo ""
echo "🔗 INTEGRATION READINESS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_component "Docker Compose file exists" "[ -f docker-compose.yml ]"
test_component "Frontend .env template exists" "[ -f frontend/.env.example ] || [ -f frontend/.env ]"
test_component "Mobile app.json exists" "[ -f mobile/app.json ]"
test_component "Laravel .env exists" "[ -f backend-laravel/.env ] || [ -f backend-laravel/.env.example ]"

# Summary
echo ""
echo "======================================"
echo "SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Passed: $PASS"
echo "❌ Failed: $FAIL"
echo "────────────────────────────────────"

if [ $FAIL -eq 0 ]; then
    echo "🎉 ALL READINESS CHECKS PASSED!"
    echo ""
    echo "Next steps:"
    echo "  1. Frontend: npm run dev"
    echo "  2. Mobile: npx expo start"
    echo "  3. Laravel: php artisan serve --port=8001"
    exit 0
else
    echo "⚠️  $FAIL checks failed. Please review."
    exit 1
fi
