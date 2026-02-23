#!/bin/bash
echo "Testing LithoVolt Backend API..."
echo ""

# Login test
echo "1. Testing Login..."
curl -s -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lithovolt.com","password":"password123"}' > /tmp/auth.json

TOKEN=$(grep -o '"access":"[^"]*"' /tmp/auth.json | sed 's/"access":"//' | sed 's/"$//')
echo "Token: ${TOKEN:0:30}..."

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Login successful"
echo ""

# Test protected endpoints
echo "2. Testing Protected Endpoints..."
echo ""

echo -n "GET /users/: "
curl -s -I -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8000/api/users/ | grep HTTP

echo -n "GET /inventory/models/: "
curl -s -I -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8000/api/inventory/models/ | grep HTTP

echo -n "GET /auth/profile/: "
curl -s -I -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8000/api/auth/profile/ | grep HTTP

echo ""
echo "3. Testing Unauthenticated Access..."
echo ""

echo -n "GET /users/ (no token): "
curl -s -I http://127.0.0.1:8000/api/users/ | grep HTTP

echo -n "GET /orders/ (no token): "
curl -s -I http://127.0.0.1:8000/api/orders/ | grep HTTP

echo ""
echo "✅ Backend API tests completed!"
