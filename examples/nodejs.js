/**
 * Alien Plugg x402 API SDK - Node.js Example
 * Demonstrates discovering endpoints, making x402 paid API calls using @coinbase/x402,
 * requesting daily trading alpha signals, and MCP server connectivity.
 */

import { x402Client } from "@coinbase/x402";

const BASE_URL = "https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d";
const MCP_URL = "https://base44.app/api/apps/6a5fdd57651262e86b24133e/functions/mcpHandshake";
const PRIVATE_KEY = process.env.EVM_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";

/**
 * 1. Discover endpoints (FREE call to /discovery)
 */
async function discoverEndpoints() {
  console.log("--- 1. Discovering Alien Plugg Endpoints ---");
  try {
    const res = await fetch(`${BASE_URL}/discovery`);
    const data = await res.json();
    console.log("Discovery Catalog:");
    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (err) {
    console.error("Discovery error:", err);
  }
}

/**
 * 2. Call a paid endpoint (gas-tracker at $0.002) using x402 payment
 */
async function callGasTracker(client) {
  console.log("\n--- 2. Calling Paid Endpoint: gas-tracker ($0.002) ---");
  const url = `${BASE_URL}/gas-tracker`;

  try {
    // x402Client handles the HTTP 402 challenge, signs USDC payment authorization on Base, and retries with header
    const response = await client.fetch(url);
    const data = await response.json();
    console.log("Gas Tracker Data:");
    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (err) {
    console.log("x402 payment execution for gas-tracker:", err.message);
  }
}

/**
 * 3. Call alien-plugg-alpha ($0.05) for daily trading signals
 */
async function callAlienPluggAlpha(client) {
  console.log("\n--- 3. Calling Daily Alpha Report: alien-plugg-alpha ($0.05) ---");
  const url = `${BASE_URL}/alien-plugg-alpha`;

  try {
    const response = await client.fetch(url);
    const data = await response.json();
    console.log("Daily Alpha Trading Signals:");
    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (err) {
    console.log("x402 payment execution for alien-plugg-alpha:", err.message);
  }
}

/**
 * 4. MCP Server Handshake & Tools
 */
async function mcpHandshake() {
  console.log("\n--- 4. MCP Server Handshake ---");
  try {
    const response = await fetch(MCP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "nodejs-x402-client", version: "1.0.0" }
        },
        id: 1
      })
    });
    const data = await response.json();
    console.log("MCP Initialize Response:");
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("MCP Handshake Error:", err);
  }
}

async function main() {
  console.log("==========================================");
  console.log("👽 Alien Plugg x402 Node.js Client Demo");
  console.log("==========================================");

  // 1. Discover free endpoints
  await discoverEndpoints();

  // Initialize @coinbase/x402 client
  const client = new x402Client({
    privateKey: PRIVATE_KEY,
    chainId: 8453 // Base Mainnet
  });

  // 2. Call gas-tracker ($0.002)
  await callGasTracker(client);

  // 3. Call alien-plugg-alpha ($0.05)
  await callAlienPluggAlpha(client);

  // 4. MCP Handshake
  await mcpHandshake();
}

main().catch(console.error);
