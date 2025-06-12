#!/bin/bash

echo "Requesting JWT token from auth-service..."

RESPONSE=$(curl -s -X POST http://auth-service:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin", "password":"admin"}')

echo "Token received:"
echo "$RESPONSE"
