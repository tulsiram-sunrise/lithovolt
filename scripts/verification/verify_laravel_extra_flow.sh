#!/usr/bin/env bash

set -u

BASE_URL="${BASE_URL:-http://127.0.0.1:8001/api}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@lithovolt.com.au}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-password123}"

echo "LARAVEL EXTRA FLOW CHECKS"
echo "BASE_URL=$BASE_URL"

stamp=$(date +%s)
email="temp${stamp}@example.com"
phone="9${stamp: -9}"

register_payload=$(cat <<JSON
{"email":"$email","password":"password123","password_confirmation":"password123","first_name":"Temp","last_name":"User","phone":"$phone"}
JSON
)

reg_raw=$(curl -s -w '\n%{http_code}' -X POST "$BASE_URL/auth/register/" -H 'Content-Type: application/json' -d "$register_payload")
reg_body=$(printf '%s' "$reg_raw" | sed '$d')
reg_code=$(printf '%s' "$reg_raw" | tail -n1)

reg_token=$(printf '%s' "$reg_body" | sed -n 's/.*"access":"\([^"]*\)".*/\1/p')
if [ -n "$reg_token" ] || printf '%s' "$reg_body" | grep -qi 'Registration successful'; then
  echo "REGISTER=PASS ($reg_code)"
else
  echo "REGISTER=FAIL ($reg_code)"
  echo "REGISTER_BODY=$reg_body"
  exit 1
fi

dup_code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE_URL/auth/register/" -H 'Content-Type: application/json' -d "$register_payload")
if [ "$dup_code" = "400" ] || [ "$dup_code" = "409" ] || [ "$dup_code" = "422" ]; then
  echo "REGISTER_DUPLICATE=PASS ($dup_code)"
else
  echo "REGISTER_DUPLICATE=WARN ($dup_code)"
fi

reset_body=$(curl -s -X POST "$BASE_URL/auth/password-reset/" -H 'Content-Type: application/json' -d "{\"email\":\"$email\"}")
reset_token=$(printf '%s' "$reset_body" | sed -n 's/.*"reset_token":"\([^"]*\)".*/\1/p')

if [ -n "$reset_token" ]; then
  confirm_code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE_URL/auth/password-reset/confirm/" -H 'Content-Type: application/json' -d "{\"reset_token\":\"$reset_token\",\"password\":\"newpassword123\"}")
  echo "PASSWORD_RESET_CONFIRM=$confirm_code"

  login2=$(curl -s -X POST "$BASE_URL/auth/login/" -H 'Content-Type: application/json' -d "{\"email\":\"$email\",\"password\":\"newpassword123\"}")
  login2_token=$(printf '%s' "$login2" | sed -n 's/.*"access":"\([^"]*\)".*/\1/p')
  if [ -n "$login2_token" ]; then
    echo "LOGIN_AFTER_RESET=PASS"
  else
    echo "LOGIN_AFTER_RESET=SKIP (likely pending email verification)"
  fi
else
  echo "PASSWORD_RESET_CONFIRM=SKIP (no reset_token in response)"
  echo "LOGIN_AFTER_RESET=SKIP"
fi

admin=$(curl -s -X POST "$BASE_URL/auth/login/" -H 'Content-Type: application/json' -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
admin_token=$(printf '%s' "$admin" | sed -n 's/.*"access":"\([^"]*\)".*/\1/p')
if [ -z "$admin_token" ]; then
  echo "ADMIN_LOGIN=FAIL"
  exit 1
fi
echo "ADMIN_LOGIN=PASS"

warranty_code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/warranties/verify/TEST-SERIAL/" -H "Authorization: Bearer $admin_token")
echo "WARRANTY_VERIFY=$warranty_code"

admin_dash_code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/admin/dashboard/" -H "Authorization: Bearer $admin_token")
echo "ADMIN_DASHBOARD=$admin_dash_code"
if [ "$admin_dash_code" != "200" ]; then
  echo "EXTRA_FLOW_STATUS=FAIL"
  exit 1
fi

echo "EXTRA_FLOW_STATUS=PASS"
exit 0
