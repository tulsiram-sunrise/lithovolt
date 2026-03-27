#!/usr/bin/env bash

set -u

BASE_URL="${BASE_URL:-http://127.0.0.1:8001/api}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@lithovolt.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-password123}"
TEST_EMAIL="${TEST_EMAIL:-invite-smoke-$(date +%s)@example.com}"

if ! command -v curl >/dev/null 2>&1; then
  echo "ERROR: curl is required but not installed."
  exit 2
fi

if ! command -v php >/dev/null 2>&1; then
  echo "ERROR: php is required but not installed."
  exit 2
fi

echo "WHOLESALER INVITE MAIL SMOKE"
echo "BASE_URL=$BASE_URL"
echo "TEST_EMAIL=$TEST_EMAIL"

login_response=$(curl -s -X POST "$BASE_URL/auth/login/" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

access_token=$(printf '%s' "$login_response" | php -r '$d=json_decode(stream_get_contents(STDIN), true); echo $d["access"] ?? "";')

if [ -z "$access_token" ]; then
  echo "LOGIN=FAIL"
  echo "ACTION=Ensure Laravel is running and credentials are valid"
  exit 1
fi

echo "LOGIN=PASS"

payload="{\"email\":\"$TEST_EMAIL\",\"name\":\"SMTP Smoke\",\"company_name\":\"Lithovolt QA\",\"notes\":\"Automated invite mail smoke\"}"
invite_response=$(curl -s -w '\nHTTP_STATUS:%{http_code}' -X POST "$BASE_URL/users/invite-wholesaler/" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $access_token" \
  -d "$payload")

http_status=$(printf '%s' "$invite_response" | sed -n 's/.*HTTP_STATUS:\([0-9]*\)$/\1/p')
body=$(printf '%s' "$invite_response" | sed '/HTTP_STATUS:/d')

invite_id=$(printf '%s' "$body" | php -r '$d=json_decode(stream_get_contents(STDIN), true); echo $d["invitation"]["id"] ?? "";')
sent_at=$(printf '%s' "$body" | php -r '$d=json_decode(stream_get_contents(STDIN), true); echo $d["invitation"]["sent_at"] ?? "";')
message=$(printf '%s' "$body" | php -r '$d=json_decode(stream_get_contents(STDIN), true); echo $d["message"] ?? ($d["error"] ?? "");')

echo "INVITE_HTTP_STATUS=${http_status:-unknown}"
echo "INVITE_MESSAGE=${message:-none}"

if [ "${http_status:-}" != "201" ]; then
  echo "INVITE_STATUS=FAIL"
  echo "ACTION=Check backend-laravel/storage/logs/laravel.log and MAIL_* env values"
  exit 1
fi

if [ -z "$invite_id" ]; then
  echo "INVITE_STATUS=FAIL"
  echo "ACTION=Invitation record missing from API response"
  exit 1
fi

echo "INVITE_ID=$invite_id"

if [ -n "$sent_at" ]; then
  echo "MAIL_SEND_STATUS=PASS"
  echo "MAIL_SENT_AT=$sent_at"
  exit 0
fi

echo "MAIL_SEND_STATUS=UNKNOWN"
echo "ACTION=Invite created but sent_at is empty; verify mail transport behavior in current environment"
exit 1
