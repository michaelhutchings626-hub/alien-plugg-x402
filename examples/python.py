#!/usr/bin/env python3
"""
Alien Plugg x402 API SDK - Python Example
Demonstrates how to discover endpoints, execute paid x402 API calls using Coinbase x402 library,
retrieve daily alpha signals, and interact with the MCP server.
"""

import os
import json
import requests
from coinbase import x402

# Configuration
BASE_URL = "https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d"
MCP_URL = "https://base44.app/api/apps/6a5fdd57651262e86b24133e/functions/mcpHandshake"
WALLET_PRIVATE_KEY = os.getenv("EVM_PRIVATE_KEY", "0x0000000000000000000000000000000000000000000000000000000000000001")


def discover_endpoints():
    """1. Discover endpoints (FREE call to /discovery)"""
    print("--- 1. Discovering Alien Plugg Endpoints ---")
    response = requests.get(f"{BASE_URL}/discovery")
    if response.status_code == 200:
        data = response.json()
        print("Discovery catalog fetched successfully:")
        print(json.dumps(data, indent=2))
        return data
    else:
        print(f"Discovery response ({response.status_code}): {response.text}")
        return None


def call_gas_tracker(x402_client):
    """2. Call a paid endpoint (gas-tracker at $0.002) using x402 payment"""
    print("\n--- 2. Calling Paid Endpoint: gas-tracker ($0.002) ---")
    endpoint_url = f"{BASE_URL}/gas-tracker"
    
    try:
        # Wrap requests session or use x402_client to automatically handle HTTP 402 payment handshake
        response = x402_client.get(endpoint_url)
        print(f"Status Code: {response.status_code}")
        print("Response Payload:")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except Exception as e:
        print(f"Executing x402 payment flow for gas-tracker: {e}")
        # Manual payment fallback example if using raw requests
        res = requests.get(endpoint_url)
        if res.status_code == 402:
            payment_header = res.headers.get("X-Payment-Required") or res.headers.get("WWW-Authenticate")
            print(f"Payment Required Details: {payment_header or res.json()}")
        return None


def call_alien_plugg_alpha(x402_client):
    """3. Call alien-plugg-alpha endpoint ($0.05) for daily trading signals"""
    print("\n--- 3. Calling Daily Alpha Report: alien-plugg-alpha ($0.05) ---")
    endpoint_url = f"{BASE_URL}/alien-plugg-alpha"
    
    try:
        response = x402_client.get(endpoint_url)
        print(f"Status Code: {response.status_code}")
        print("Alien Plugg Alpha Signals:")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except Exception as e:
        print(f"Alpha report call error / x402 handling: {e}")
        return None


def interact_with_mcp():
    """4. MCP Server Handshake & Tools Listing"""
    print("\n--- 4. MCP Server Handshake & Tool Listing ---")
    init_payload = {
        "jsonrpc": "2.0",
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "python-x402-client", "version": "1.0.0"}
        },
        "id": 1
    }
    
    response = requests.post(MCP_URL, json=init_payload)
    print(f"MCP Initialize Response ({response.status_code}):")
    print(json.dumps(response.json(), indent=2))

    tools_payload = {
        "jsonrpc": "2.0",
        "method": "tools/list",
        "params": {},
        "id": 2
    }
    tools_res = requests.post(MCP_URL, json=tools_payload)
    print("\nMCP Tools List:")
    print(json.dumps(tools_res.json(), indent=2))


def main():
    print("==========================================")
    print("👽 Alien Plugg x402 Python Client Demo")
    print("==========================================")

    # Step 1: Free discovery call
    discover_endpoints()

    # Initialize Coinbase x402 client with EVM wallet
    # Coinbase x402 handles signing USDC payment authorizations on Base (Chain ID 8453)
    x402_client = x402.Client(
        private_key=WALLET_PRIVATE_KEY,
        chain_id=8453 # Base Mainnet
    )

    # Step 2: Call paid gas-tracker endpoint ($0.002)
    call_gas_tracker(x402_client)

    # Step 3: Call paid alien-plugg-alpha endpoint ($0.05)
    call_alien_plugg_alpha(x402_client)

    # Step 4: Interact with MCP Server
    interact_with_mcp()


if __name__ == "__main__":
    main()
