#!/bin/bash

echo "🔐 Requesting JWT token from auth-service..."

TOKEN=$(curl -s -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}')

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to retrieve token."
  exit 1
fi

echo "✅ Token received:"
echo "$TOKEN"

echo ""
echo "🚀 Sending request to test API via Gateway..."

curl -v -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/test/hello
