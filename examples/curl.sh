#!/usr/bin/env bash
# Alien Plugg x402 API - cURL Examples
# Base URL: https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/

set -e

BASE_URL="https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d"
MCP_URL="https://base44.app/api/apps/6a5fdd57651262e86b24133e/functions/mcpHandshake"

echo "=========================================="
echo "👽 Alien Plugg x402 API SDK - cURL Examples"
echo "=========================================="
echo ""

# ---------------------------------------------------------
# 1. Discover Endpoints (FREE)
# ---------------------------------------------------------
echo "1. Discovering endpoints (FREE)..."
curl -s "${BASE_URL}/discovery" | python3 -m json.tool || curl -s "${BASE_URL}/discovery"
echo -e "\n"

# ---------------------------------------------------------
# 2. Call Gas Tracker Endpoint ($0.002) - Payment Flow Demonstration
# ---------------------------------------------------------
echo "2. Querying Gas Tracker endpoint ($0.002)..."
echo "Step 2a: Send request to gas-tracker to receive x402 Payment Required response"
RESPONSE_402=$(curl -s -i "${BASE_URL}/gas-tracker")
echo "$RESPONSE_402" | head -n 20
echo -e "\n"

echo "Step 2b: Once payment authorization is generated via x402 client/wallet,"
echo "send request with X-PAYMENT or Authorization header:"
echo "Example header: X-PAYMENT: <x402-payment-payload-or-signature>"
echo "cURL command:"
echo "curl -s -H 'X-PAYMENT: \$PAYMENT_SIGNATURE' '${BASE_URL}/gas-tracker'"
echo -e "\n"

# ---------------------------------------------------------
# 3. Call Alien Plugg Alpha Endpoint ($0.05)
# ---------------------------------------------------------
echo "3. Querying Alien Plugg Alpha Daily Report ($0.05)..."
echo "cURL command:"
echo "curl -s -H 'X-PAYMENT: \$PAYMENT_SIGNATURE' '${BASE_URL}/alien-plugg-alpha'"
echo -e "\n"

# ---------------------------------------------------------
# 4. MCP Server Handshake
# ---------------------------------------------------------
echo "4. Checking MCP Server Handshake..."
curl -s -X POST "${MCP_URL}" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": { "name": "curl-client", "version": "1.0.0" }
    },
    "id": 1
  }' | python3 -m json.tool || true
echo -e "\n"

echo "=========================================="
echo "Done!"
