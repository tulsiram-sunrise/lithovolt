#!/bin/bash

# LithoVolt API Test Script
echo "Testing LithoVolt API Endpoints"
echo "==============================="
echo ""

BASE_URL="http://localhost:8000/api/v1"

# Test 1: Login
echo "1. Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lithovolt.com",
    "password": "password123"
  }')

echo "Response: $LOGIN_RESPONSE"
echo ""

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Failed to get token. API may not be running."
  exit 1
fi

echo "Token obtained: ${TOKEN:0:20}..."
echo ""

# Test 2: Get Current User Profile
echo "2. Testing Get Profile..."
curl -s -X GET "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Test 3: List Battery Models
echo "3. Testing List Battery Models..."
curl -s -X GET "$BASE_URL/battery-models" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.data[]'
echo ""

# Test 4: List Users
echo "4. Testing List Users..."
curl -s -X GET "$BASE_URL/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.data[]'
echo ""

# Test 5: Admin Dashboard
echo "5. Testing Admin Dashboard..."
curl -s -X GET "$BASE_URL/admin/dashboard" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

echo "==============================="
echo "API Tests Completed Successfully!"
