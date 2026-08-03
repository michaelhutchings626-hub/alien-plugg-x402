/**
 * Alien Plugg x402 → RapidAPI Proxy
 * 
 * Accepts standard RapidAPI requests (x-rapidapi-key header)
 * Pays x402 USDC micropayments on Base automatically
 * Returns data to RapidAPI users (no crypto knowledge needed)
 */

const express = require("express");
const cors = require("cors");
const { x402Client, wrapFetchWithPayment } = require("@x402/fetch");
const { ExactEvmScheme, toClientEvmSigner } = require("@x402/evm");
const { privateKeyToAccount } = require("viem/accounts");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const BANKR_BASE = "https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d";

// --- x402 Payment Client ---
const PROXY_PRIVATE_KEY = process.env.PROXY_WALLET_PRIVATE_KEY;
if (!PROXY_PRIVATE_KEY) {
  console.error("FATAL: Set PROXY_WALLET_PRIVATE_KEY env var");
  process.exit(1);
}

const account = privateKeyToAccount(
  PROXY_PRIVATE_KEY.startsWith("0x") ? PROXY_PRIVATE_KEY : "0x" + PROXY_PRIVATE_KEY
);
const signer = toClientEvmSigner(account);
const client = new x402Client();
client.register("eip155:*", new ExactEvmScheme(signer));
const fetchWithPayment = wrapFetchWithPayment(globalThis.fetch, client);

console.log(`Proxy wallet: ${account.address}`);
console.log("Fund this address with USDC on Base to pay for x402 calls");

// --- Endpoint Catalog ---
const ENDPOINTS = {
  // Robinhood Chain Stock Tokens
  "rh-stock-prices":       { path: "/rh-stock-prices",       price: 0.02, cat: "Stock Tokens" },
  "rh-stock-list":         { path: "/rh-stock-list",         price: 0.01, cat: "Stock Tokens" },
  "rh-corporate-actions":  { path: "/rh-corporate-actions",  price: 0.03, cat: "Stock Tokens" },
  "rh-stock-screener":     { path: "/rh-stock-screener",     price: 0.02, cat: "Stock Tokens" },
  "rh-dex-scanner":        { path: "/rh-dex-scanner",        price: 0.02, cat: "Stock Tokens" },
  // Zora Crypto
  "zora-scanner":          { path: "/zora-scanner",          price: 0.01, cat: "Crypto" },
  "robinhood-scanner":     { path: "/robinhood-scanner",     price: 0.01, cat: "Crypto" },
  "rug-check":             { path: "/zora-rug-check",        price: 0.02, cat: "Crypto" },
  "honeypot-check":        { path: "/honeypot-check",        price: 0.04, cat: "Crypto" },
  "holder-analysis":       { path: "/holder-analysis",       price: 0.03, cat: "Crypto" },
  "sentiment":             { path: "/zora-sentiment",        price: 0.05, cat: "Crypto" },
  "portfolio":             { path: "/zora-portfolio",        price: 0.005, cat: "Crypto" },
  "chart-roast":           { path: "/chart-roast",           price: 0.008, cat: "Crypto" },
  "new-launches":          { path: "/new-launches",          price: 0.01, cat: "Crypto" },
  "creator-lookup":        { path: "/creator-lookup",        price: 0.01, cat: "Crypto" },
  // On-Chain
  "token-price":           { path: "/token-price",          price: 0.015, cat: "On-Chain" },
  "token-compare":         { path: "/token-compare",        price: 0.005, cat: "On-Chain" },
  "whale-tracker":         { path: "/whale-tracker",        price: 0.08, cat: "On-Chain" },
  "smart-money":           { path: "/smart-money",          price: 0.08, cat: "On-Chain" },
  "dex-flow":              { path: "/dex-flow",             price: 0.12, cat: "On-Chain" },
  "wallet-profile":        { path: "/wallet-profile",       price: 0.003, cat: "On-Chain" },
  "gas-tracker":           { path: "/gas-tracker",          price: 0.002, cat: "On-Chain" },
  "tx-status":             { path: "/tx-status",            price: 0.002, cat: "On-Chain" },
  "builder-score":         { path: "/builder-score",        price: 0.008, cat: "On-Chain" },
  // Utilities
  "translate":             { path: "/translate",            price: 0.005, cat: "Utility" },
  "ip-info":               { path: "/ip-info",              price: 0.0015, cat: "Utility" },
  "expand-url":            { path: "/expand-url",           price: 0.015, cat: "Utility" },
  "tech-stack":            { path: "/tech-stack-detect",    price: 0.008, cat: "Utility" },
  "webpage-diff":          { path: "/webpage-diff",          price: 0.03, cat: "Utility" },
  "price-alerts":          { path: "/price-alerts",         price: 0.008, cat: "Utility" },
  // Premium
  "daily-alpha":           { path: "/alien-plugg-alpha",    price: 0.05, cat: "Premium" },
  "pro-alpha":             { path: "/alien-plugg-pro-alpha", price: 0.25, cat: "Premium" },
};

// --- Rate Limiting ---
const usage = new Map();
const TIERS = {
  free:       { monthly: 100,  label: "Free" },
  basic:      { monthly: 1000, label: "Basic" },
  pro:        { monthly: 5000, label: "Pro" },
  enterprise: { monthly: 20000, label: "Enterprise" },
};

function getKeyTier(apiKey) {
  return "free";
}

function checkRateLimit(apiKey) {
  const now = Date.now();
  const monthMs = 30 * 24 * 60 * 60 * 1000;
  if (!usage.has(apiKey)) usage.set(apiKey, { count: 0, resetTime: now + monthMs });
  const record = usage.get(apiKey);
  if (now > record.resetTime) { record.count = 0; record.resetTime = now + monthMs; }
  return record;
}

// --- Routes ---

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "Alien Plugg x402 Proxy",
    wallet: account.address,
    endpoints: Object.keys(ENDPOINTS).length,
    version: "2.0.0",
  });
});

app.get("/endpoints", (req, res) => {
  res.json({
    total: Object.keys(ENDPOINTS).length,
    endpoints: Object.entries(ENDPOINTS).map(([name, info]) => ({
      name,
      path: `/api?endpoint=${name}`,
      method: "GET",
      category: info.cat,
      x402Price: `$${info.price} USDC`,
    })),
  });
});

app.get("/api", async (req, res) => {
  const rapidApiKey = req.headers["x-rapidapi-key"] || req.headers["x-rapidapi-proxy-secret"];
  if (!rapidApiKey) {
    return res.status(401).json({ error: "Missing RapidAPI API key" });
  }

  const endpointName = req.query.endpoint;
  if (!endpointName || !ENDPOINTS[endpointName]) {
    return res.status(400).json({
      error: "Invalid or missing 'endpoint' parameter",
      available: Object.keys(ENDPOINTS),
    });
  }

  const tier = getKeyTier(rapidApiKey);
  const usageRecord = checkRateLimit(rapidApiKey);
  if (usageRecord.count >= TIERS[tier].monthly) {
    return res.status(429).json({
      error: "Monthly limit exceeded",
      used: usageRecord.count,
      limit: TIERS[tier].monthly,
      tier: TIERS[tier].label,
    });
  }

  const endpointInfo = ENDPOINTS[endpointName];
  const forwardParams = { ...req.query };
  delete forwardParams.endpoint;
  const queryString = new URLSearchParams(forwardParams).toString();
  const targetUrl = queryString
    ? `${BANKR_BASE}${endpointInfo.path}?${queryString}`
    : `${BANKR_BASE}${endpointInfo.path}`;

  try {
    const response = await fetchWithPayment(targetUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    const data = await response.json();
    usageRecord.count++;

    console.log(`[${new Date().toISOString()}] ${endpointName} — ${response.status} — usage ${usageRecord.count}/${TIERS[tier].monthly}`);

    res.status(response.status).json({
      endpoint: endpointName,
      category: endpointInfo.cat,
      data,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ERROR ${endpointName}:`, error.message);
    res.status(502).json({
      error: "x402 call failed",
      message: error.message,
      endpoint: endpointName,
    });
  }
});

app.post("/api", async (req, res) => {
  const rapidApiKey = req.headers["x-rapidapi-key"] || req.headers["x-rapidapi-proxy-secret"];
  if (!rapidApiKey) return res.status(401).json({ error: "Missing RapidAPI API key" });

  const endpointName = req.query.endpoint || req.body.endpoint;
  if (!endpointName || !ENDPOINTS[endpointName]) {
    return res.status(400).json({ error: "Invalid endpoint", available: Object.keys(ENDPOINTS) });
  }

  const usageRecord = checkRateLimit(rapidApiKey);
  const tier = getKeyTier(rapidApiKey);
  if (usageRecord.count >= TIERS[tier].monthly) {
    return res.status(429).json({ error: "Monthly limit exceeded" });
  }

  const targetUrl = `${BANKR_BASE}${ENDPOINTS[endpointName].path}`;
  try {
    const response = await fetchWithPayment(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    usageRecord.count++;
    res.status(response.status).json({ endpoint: endpointName, data });
  } catch (error) {
    res.status(502).json({ error: "x402 proxy failed", message: error.message });
  }
});

app.get("/admin/balance", async (req, res) => {
  if (req.headers["x-admin-key"] !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
    const RPC = "https://mainnet.base.org";
    const balanceRes = await fetch(RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [{ to: USDC, data: `0x70a08231000000000000000000000000${account.address.slice(2)}` }, "latest"],
        id: 1,
      }),
    });
    const balanceData = await balanceRes.json();
    const balance = parseInt(balanceData.result, 16) / 1e6;

    res.json({
      wallet: account.address,
      usdcBalance: `$${balance.toFixed(2)}`,
      totalCalls: Array.from(usage.values()).reduce((sum, r) => sum + r.count, 0),
      activeKeys: usage.size,
      endpoints: Object.keys(ENDPOINTS).length,
    });
  } catch (error) {
    res.json({ wallet: account.address, error: "Could not fetch balance" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Alien Plugg x402 Proxy running on port ${PORT}`);
  console.log(`💰 Proxy wallet: ${account.address}`);
  console.log(`📡 ${Object.keys(ENDPOINTS).length} endpoints available`);
});
