#!/bin/bash

# Nytt användarnamn och lösenord (ändra gärna)
USERNAME="testuser_$RANDOM"
PASSWORD="testpass123"
ROLE="ROLE_ADMIN"

echo "🔐 Registrerar användare: $USERNAME"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8081/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\", \"password\":\"$PASSWORD\", \"role\":\"$ROLE\"}")

if [ "$RESPONSE" -eq 200 ]; then
  echo "✅ Registrering lyckades"
else
  echo "❌ Registrering misslyckades (status $RESPONSE)"
  exit 1
fi

echo ""
echo "🔑 Loggar in som: $USERNAME"
TOKEN=$(curl -s -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\", \"password\":\"$PASSWORD\"}")

if [[ "$TOKEN" == *"eyJ"* ]]; then
  echo "✅ Token mottagen:"
  echo "$TOKEN"
else
  echo "❌ Inloggning misslyckades"
  echo "$TOKEN"
fi
