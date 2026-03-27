#!/usr/bin/env bash

set -u

BASE_URL="${BASE_URL:-http://127.0.0.1:8001/api}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@lithovolt.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-password123}"

ENDPOINTS=(
  "auth/profile"
  "inventory/categories"
  "inventory/products"
  "inventory/accessories"
  "inventory/serials"
  "inventory/catalog"
  "orders"
  "warranties"
  "warranty-claims"
  "notifications"
  "admin/metrics"
  "admin/roles"
  "admin/permissions"
  "admin/staff"
)

if ! command -v curl >/dev/null 2>&1; then
  echo "ERROR: curl is required but not installed."
  exit 2
fi

if ! command -v php >/dev/null 2>&1; then
  echo "ERROR: php is required but not installed."
  exit 2
fi

echo "LARAVEL AUTHENTICATED MATRIX"
echo "BASE_URL=$BASE_URL"
echo "ADMIN_EMAIL=$ADMIN_EMAIL"

login_response=$(curl -s -X POST "$BASE_URL/auth/login/" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

access_token=$(printf '%s' "$login_response" | php -r '$d=json_decode(stream_get_contents(STDIN), true); echo $d["access"] ?? "";')
error_message=$(printf '%s' "$login_response" | php -r '$d=json_decode(stream_get_contents(STDIN), true); echo $d["error"] ?? ($d["message"] ?? "");')

if [ -z "$access_token" ]; then
  tcp_status=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/auth/profile/")
  if [ "$tcp_status" = "000" ]; then
    echo "LOGIN=FAIL"
    echo "DIAGNOSIS=Server unreachable at $BASE_URL"
    echo "ACTION=Start Laravel server: cd backend-laravel && php artisan serve --host=127.0.0.1 --port=8001"
    exit 1
  fi

  echo "LOGIN=FAIL"
  if [ -n "$error_message" ]; then
    echo "ERROR_MESSAGE=$error_message"
  fi

  if [ "$error_message" = "Invalid credentials" ]; then
    echo "ACTION=Re-seed baseline users: cd backend-laravel && php artisan db:seed"
  else
    echo "ACTION=Inspect login response and backend logs."
    echo "LOGIN_RESPONSE=$login_response"
  fi
  exit 1
fi

echo "LOGIN=PASS"

failed=0
for endpoint in "${ENDPOINTS[@]}"; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/$endpoint/" -H "Authorization: Bearer $access_token")
  echo "$endpoint=$code"
  if [ "$code" != "200" ]; then
    failed=1
  fi
done

if [ "$failed" -eq 0 ]; then
  echo "MATRIX_STATUS=PASS"
  exit 0
fi

echo "MATRIX_STATUS=FAIL"
exit 1
