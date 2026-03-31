#!/bin/bash
set +H

email="admin@lithovolt.com.au"
password="password123"

echo "1. Login..."
login_response=$(curl -s -X POST http://127.0.0.1:8001/api/auth/login/ \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$email\",\"password\":\"$password\"}")

echo "Login response: $login_response"

token=$(echo "$login_response" | grep -o '"access":"[^"]*' | cut -d'"' -f4)
echo "Token: $token"

if [ -z "$token" ]; then
  echo "ERROR: Login failed!"
  exit 1
fi

echo -e "\n2. Check profile..."
profile=$(curl -s -X GET http://127.0.0.1:8001/api/auth/profile/ \
  -H "Authorization: Bearer $token")

echo "Profile: $profile"

echo -e "\n3. Try admin/roles..."
roles=$(curl -s -X GET http://127.0.0.1:8001/api/admin/roles/ \
  -H "Authorization: Bearer $token" \
  -w "\nHTTP_CODE:%{http_code}\n")

echo "$roles"
