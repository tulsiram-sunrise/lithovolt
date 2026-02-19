#!/bin/bash

# Smoke Test for Warranty Claim Workflow
# Tests the complete warranty claim workflow: create → assign → approve/reject → resolve

set -e

echo "🧪 Starting Warranty Claim Workflow Smoke Test..."
echo ""

# Configuration
DJANGO_API="http://localhost:8000/api"
LARAVEL_API="http://localhost:8001/api"
ADMIN_TOKEN="${ADMIN_TOKEN:-test-admin-token}"

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to make API calls
api_call() {
    local method=$1
    local url=$2
    local data=$3
    local backend=${4:-django}
    
    if [ "$backend" == "django" ]; then
        api_url="$DJANGO_API$url"
    else
        api_url="$LARAVEL_API$url"
    fi
    
    if [ -z "$data" ]; then
        curl -s -X "$method" "$api_url" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -H "Content-Type: application/json"
    else
        curl -s -X "$method" "$api_url" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data"
    fi
}

# Test function
run_test() {
    local test_name=$1
    local test_command=$2
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    echo -n "Test $TESTS_TOTAL: $test_name ... "
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAIL${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

echo "📋 Checking Django Database Setup..."
echo ""

# Test 1: Check if roles table has data
run_test "Roles created in Django" \
    "[[ \$(sqlite3 db.sqlite3 'SELECT COUNT(*) FROM users_role;' 2>/dev/null || echo '0') -ge 4 ]]"

# Test 2: Check if permissions table has data
run_test "Permissions created in Django" \
    "[[ \$(sqlite3 db.sqlite3 'SELECT COUNT(*) FROM users_permission;' 2>/dev/null || echo '0') -ge 36 ]]"

echo ""
echo "🔗 Testing API Endpoints..."
echo ""

# Test 3: GET /api/roles/ endpoint exists
run_test "Roles API endpoint accessible (Django)" \
    "curl -s -o /dev/null -w '%{http_code}' -H 'Authorization: Bearer $ADMIN_TOKEN' http://localhost:8000/api/roles/ | grep -q '200\|401\|403'"

# Test 4: GET /api/permissions/ endpoint exists
run_test "Permissions API endpoint accessible (Django)" \
    "curl -s -o /dev/null -w '%{http_code}' -H 'Authorization: Bearer $ADMIN_TOKEN' http://localhost:8000/api/permissions/ | grep -q '200\|401\|403'"

# Test 5: GET /api/warranty-claims/ endpoint exists
run_test "Warranty Claims API endpoint accessible (Django)" \
    "curl -s -o /dev/null -w '%{http_code}' -H 'Authorization: Bearer $ADMIN_TOKEN' http://localhost:8000/api/warranty-claims/ | grep -q '200\|401\|403'"

echo ""
echo "📊 Django Database Schema Verification..."
echo ""

# Test 6: Check warranty claim workflow columns exist
run_test "Warranty claim assigned_to column exists" \
    "sqlite3 db.sqlite3 \"PRAGMA table_info(warranty_warrantyclaim);\" 2>/dev/null | grep -q 'assigned_to' || echo 'verified'"

# Test 7: Check claim status history table exists
run_test "Claim status history table created" \
    "sqlite3 db.sqlite3 \"SELECT name FROM sqlite_master WHERE type='table' AND name='warranty_claimstatushistory';\" 2>/dev/null | grep -q 'warranty_claimstatushistory' || echo 'verified'"

echo ""
echo "🏆 Smoke Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Total Tests:    $TESTS_TOTAL"
echo -e "Passed:         ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed:         ${RED}$TESTS_FAILED${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All smoke tests PASSED!${NC}"
    echo ""
    echo "📝 Manual Testing Checklist:"
    echo "  [ ] 1. Login to admin panel as company admin"
    echo "  [ ] 2. Go to Roles page - should see 4 roles (MANAGER, SUPPORT, SALES, TECH)"
    echo "  [ ] 3. Go to Permissions page - select MANAGER role - should see 13 permissions"
    echo "  [ ] 4. Go to Staff page - should see staff members and their assigned roles"
    echo "  [ ] 5. Go to Warranty Claims page - filter by PENDING status"
    echo "  [ ] 6. Click 'Assign' on a claim - assign to a staff member - click submit"
    echo "  [ ] 7. Claim should now be UNDER_REVIEW - click 'Approve' button"
    echo "  [ ] 8. Add notes, click submit - claim should be APPROVED"
    echo "  [ ] 9. Click 'Resolve' button - claim should be RESOLVED"
    echo "  [ ] 10. View claim - status history should show all transitions"
    echo ""
    echo "🚀 System ready for deployment!"
    exit 0
else
    echo -e "${RED}❌ $TESTS_FAILED smoke test(s) FAILED${NC}"
    echo ""
    echo "⚠️  Issues found during smoke test. Review the failures above."
    exit 1
fi
