/**
 * Alien Plugg x402 → RapidAPI Proxy v2.2.0
 * 
 * Accepts standard RapidAPI requests (x-rapidapi-key header)
 * Pays x402 USDC micropayments on Base automatically
 * Returns data to RapidAPI users (no crypto knowledge needed)
 * 
 * 38 endpoints at flat $0.003/call
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

// --- Endpoint Catalog (38 endpoints, flat $0.003/call) ---
const ENDPOINTS = {
  "rh-stock-prices":       { path: "/rh-stock-prices",       price: 0.003, cat: "Stock Tokens" },
  "rh-stock-list":         { path: "/rh-stock-list",         price: 0.003, cat: "Stock Tokens" },
  "rh-corporate-actions":  { path: "/rh-corporate-actions",  price: 0.003, cat: "Stock Tokens" },
  "rh-stock-screener":     { path: "/rh-stock-screener",     price: 0.003, cat: "Stock Tokens" },
  "rh-dex-scanner":        { path: "/rh-dex-scanner",        price: 0.003, cat: "Stock Tokens" },
  "robinhood-scanner":     { path: "/robinhood-scanner",     price: 0.003, cat: "Stock Tokens" },
  "zora-scanner":          { path: "/zora-scanner",          price: 0.003, cat: "Crypto" },
  "new-launches":          { path: "/new-launches",          price: 0.003, cat: "Crypto" },
  "rug-check":             { path: "/zora-rug-check",        price: 0.003, cat: "Crypto" },
  "portfolio":             { path: "/zora-portfolio",        price: 0.003, cat: "Crypto" },
  "sentiment":             { path: "/zora-sentiment",        price: 0.003, cat: "Crypto" },
  "honeypot-check":        { path: "/honeypot-check",        price: 0.003, cat: "Crypto" },
  "holder-analysis":       { path: "/holder-analysis",       price: 0.003, cat: "Crypto" },
  "creator-lookup":        { path: "/creator-lookup",        price: 0.003, cat: "Crypto" },
  "chart-roast":           { path: "/chart-roast",           price: 0.003, cat: "Crypto" },
  "token-compare":         { path: "/token-compare",        price: 0.003, cat: "Crypto" },
  "token-price":           { path: "/token-price",          price: 0.003, cat: "On-Chain" },
  "whale-tracker":         { path: "/whale-tracker",        price: 0.003, cat: "On-Chain" },
  "smart-money":           { path: "/smart-money",          price: 0.003, cat: "On-Chain" },
  "wallet-profile":        { path: "/wallet-profile",       price: 0.003, cat: "On-Chain" },
  "gas-tracker":           { path: "/gas-tracker",          price: 0.003, cat: "On-Chain" },
  "tx-status":             { path: "/tx-status",            price: 0.003, cat: "On-Chain" },
  "builder-score":         { path: "/builder-score",        price: 0.003, cat: "On-Chain" },
  "price-alerts":          { path: "/price-alerts",         price: 0.003, cat: "Alerts" },
  "whale-alert":           { path: "/whale-alert",          price: 0.003, cat: "Alerts" },
  "rug-alert":             { path: "/rug-alert",            price: 0.003, cat: "Alerts" },
  "launch-alert":          { path: "/launch-alert",         price: 0.003, cat: "Alerts" },
  "translate":             { path: "/translate",            price: 0.003, cat: "Utility" },
  "ip-info":               { path: "/ip-info",              price: 0.003, cat: "Utility" },
  "expand-url":            { path: "/expand-url",           price: 0.003, cat: "Utility" },
  "tech-stack":            { path: "/tech-stack-detect",    price: 0.003, cat: "Utility" },
  "webpage-diff":          { path: "/webpage-diff",          price: 0.003, cat: "Utility" },
  "daily-alpha":           { path: "/alien-plugg-alpha",    price: 0.003, cat: "Premium" },
  "pro-alpha":             { path: "/alien-plugg-pro-alpha", price: 0.003, cat: "Premium" },
  "dex-flow":              { path: "/dex-flow",             price: 0.003, cat: "On-Chain" },
  "discovery":             { path: "/discovery",            price: 0.001, cat: "Discovery" },
  "mcp-handshake":         { path: "/mcp-handshake",         price: 0.001, cat: "Discovery" },
  "mcp-server":            { path: "/mcp-server",           price: 0.003, cat: "Discovery" },
};

// --- Rate Limiting ---
const usage = new Map();
const startTime = Date.now();
const TIERS = {
  basic:  { monthly: 500,    label: "Basic",  price: "$0/mo" },
  pro:    { monthly: 7000,   label: "Pro",    price: "$5/mo" },
  ultra:  { monthly: 25000,  label: "Ultra",  price: "$19/mo" },
  mega:   { monthly: 130000, label: "Mega",   price: "$99/mo" },
};

function getKeyTier(apiKey) { return "basic"; }

function checkRateLimit(apiKey) {
  const now = Date.now();
  const monthMs = 30 * 24 * 60 * 60 * 1000;
  if (!usage.has(apiKey)) usage.set(apiKey, { count: 0, resetTime: now + monthMs });
  const record = usage.get(apiKey);
  if (now > record.resetTime) { record.count = 0; record.resetTime = now + monthMs; }
  return record;
}

// --- Parameter Normalization ---
function normalizeParams(endpointName, params) {
  const normalized = { ...params };
  const paramMaps = {
    "rug-check":       { address: "address", token: "address" },
    "portfolio":       { address: "address", wallet: "address" },
    "sentiment":       { token: "token", address: "token", coin: "token" },
    "honeypot-check":  { token: "token", address: "token" },
    "holder-analysis": { token: "token", address: "token" },
    "whale-tracker":   { token: "token", address: "token" },
    "smart-money":     { token: "token", address: "token" },
    "chart-roast":     { token: "token", address: "token" },
    "token-compare":   { a: "a", b: "b", token1: "a", token2: "b" },
    "wallet-profile":  { address: "address", wallet: "address" },
    "creator-lookup":  { handle: "handle", username: "handle" },
    "gas-tracker":     { chain: "chain", network: "chain" },
    "tx-status":       { tx: "tx", txhash: "tx", hash: "tx" },
    "token-price":     { symbol: "symbol", id: "id" },
    "rh-stock-prices": { symbol: "symbol", ticker: "symbol" },
    "builder-score":   { handle: "handle", username: "handle" },
    "translate":       { text: "text", target: "target", to: "target", lang: "target" },
    "ip-info":         { ip: "ip", address: "ip" },
    "expand-url":      { url: "url", link: "url" },
    "tech-stack":      { url: "url", website: "url" },
    "webpage-diff":    { url: "url", website: "url" },
    "price-alerts":    { action: "action", type: "action" },
    "whale-alert":     { action: "action", type: "action" },
    "rug-alert":       { action: "action", type: "action" },
    "launch-alert":    { action: "action", type: "action" },
    "dex-flow":        { token: "token", address: "token" },
  };
  const map = paramMaps[endpointName];
  if (map) {
    for (const [alias, canonical] of Object.entries(map)) {
      if (normalized[alias] !== undefined && normalized[canonical] === undefined) {
        normalized[canonical] = normalized[alias];
        if (alias !== canonical) delete normalized[alias];
      }
    }
  }
  return normalized;
}

// --- Health Check ---
async function getWalletBalance() {
  try {
    const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
    const RPC = "https://mainnet.base.org";
    const balanceRes = await fetch(RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", method: "eth_call",
        params: [{ to: USDC, data: `0x70a08231000000000000000000000000${account.address.slice(2)}` }, "latest"], id: 1,
      }),
    });
    const balanceData = await balanceRes.json();
    return parseInt(balanceData.result, 16) / 1e6;
  } catch { return null; }
}

async function checkUpstreamHealth() {
  try {
    const response = await fetch(`${BANKR_BASE}/discovery`, {
      method: "GET", headers: { Accept: "application/json" }, signal: AbortSignal.timeout(5000),
    });
    return response.ok || response.status === 402;
  } catch { return false; }
}

app.get("/health", async (req, res) => {
  const uptimeSec = Math.floor((Date.now() - startTime) / 1000);
  const totalCalls = Array.from(usage.values()).reduce((sum, r) => sum + r.count, 0);
  const [usdcBalance, upstreamOk] = await Promise.all([getWalletBalance(), checkUpstreamHealth()]);
  const categories = {};
  for (const [name, info] of Object.entries(ENDPOINTS)) {
    if (!categories[info.cat]) categories[info.cat] = [];
    categories[info.cat].push(name);
  }
  res.json({
    status: upstreamOk ? "ok" : "degraded",
    service: "Alien Plugg x402 Proxy",
    version: "2.2.0",
    timestamp: new Date().toISOString(),
    uptime: { seconds: uptimeSec, human: `${Math.floor(uptimeSec/3600)}h ${Math.floor((uptimeSec%3600)/60)}m ${uptimeSec%60}s` },
    wallet: { address: account.address, usdcBalance: usdcBalance !== null ? `$${usdcBalance.toFixed(2)}` : "unavailable", funded: usdcBalance !== null && usdcBalance > 0.01 },
    upstream: { url: BANKR_BASE, status: upstreamOk ? "online" : "offline" },
    endpoints: { total: Object.keys(ENDPOINTS).length, categories: Object.fromEntries(Object.entries(categories).map(([c,n]) => [c, n.length])) },
    usage: { totalCalls, activeKeys: usage.size },
    pricing: { flatRate: "$0.003 USDC/call", tiers: Object.fromEntries(Object.entries(TIERS).map(([k,v]) => [k, { calls: v.monthly, price: v.price }])) },
  });
});

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "Alien Plugg x402 Proxy", version: "2.2.0", wallet: account.address, endpoints: Object.keys(ENDPOINTS).length, health: "/health", docs: "/endpoints" });
});

app.get("/endpoints", (req, res) => {
  res.json({
    total: Object.keys(ENDPOINTS).length,
    flatPrice: "$0.003 USDC/call",
    endpoints: Object.entries(ENDPOINTS).map(([name, info]) => ({
      name, path: `/api?endpoint=${name}`, method: "GET", category: info.cat, x402Price: `$${info.price} USDC`,
    })),
  });
});

app.get("/api", async (req, res) => {
  const rapidApiKey = req.headers["x-rapidapi-key"] || req.headers["x-rapidapi-proxy-secret"] || req.headers["x-api-key"];
  if (!rapidApiKey) return res.status(401).json({ error: "Missing API key (x-rapidapi-key header required)" });
  const endpointName = req.query.endpoint;
  if (!endpointName || !ENDPOINTS[endpointName]) {
    return res.status(400).json({ error: "Invalid or missing 'endpoint' parameter", available: Object.keys(ENDPOINTS), total: Object.keys(ENDPOINTS).length });
  }
  const tier = getKeyTier(rapidApiKey);
  const usageRecord = checkRateLimit(rapidApiKey);
  if (usageRecord.count >= TIERS[tier].monthly) {
    return res.status(429).json({ error: "Monthly limit exceeded", used: usageRecord.count, limit: TIERS[tier].monthly, tier: TIERS[tier].label });
  }
  const endpointInfo = ENDPOINTS[endpointName];
  const forwardParams = normalizeParams(endpointName, { ...req.query });
  delete forwardParams.endpoint;
  const queryString = new URLSearchParams(forwardParams).toString();
  const targetUrl = queryString ? `${BANKR_BASE}${endpointInfo.path}?${queryString}` : `${BANKR_BASE}${endpointInfo.path}`;
  try {
    const response = await fetchWithPayment(targetUrl, { method: "GET", headers: { Accept: "application/json" } });
    const data = await response.json();
    usageRecord.count++;
    console.log(`[${new Date().toISOString()}] ${endpointName} — ${response.status} — usage ${usageRecord.count}/${TIERS[tier].monthly}`);
    res.status(response.status).json({ endpoint: endpointName, category: endpointInfo.cat, data });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ERROR ${endpointName}:`, error.message);
    res.status(502).json({ error: "Upstream request failed", endpoint: endpointName, detail: error.message });
  }
});

app.post("/api", async (req, res) => {
  const rapidApiKey = req.headers["x-rapidapi-key"] || req.headers["x-rapidapi-proxy-secret"] || req.headers["x-api-key"];
  if (!rapidApiKey) return res.status(401).json({ error: "Missing API key" });
  const endpointName = req.query.endpoint || req.body.endpoint;
  if (!endpointName || !ENDPOINTS[endpointName]) {
    return res.status(400).json({ error: "Invalid or missing 'endpoint' parameter", available: Object.keys(ENDPOINTS) });
  }
  const tier = getKeyTier(rapidApiKey);
  const usageRecord = checkRateLimit(rapidApiKey);
  if (usageRecord.count >= TIERS[tier].monthly) {
    return res.status(429).json({ error: "Monthly limit exceeded", used: usageRecord.count, limit: TIERS[tier].monthly, tier: TIERS[tier].label });
  }
  const endpointInfo = ENDPOINTS[endpointName];
  try {
    const response = await fetchWithPayment(`${BANKR_BASE}${endpointInfo.path}`, {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(req.body),
    });
    const data = await response.json();
    usageRecord.count++;
    res.status(response.status).json({ endpoint: endpointName, category: endpointInfo.cat, data });
  } catch (error) {
    res.status(502).json({ error: "Upstream request failed", endpoint: endpointName, detail: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Alien Plugg x402 Proxy v2.2.0 running on port ${PORT}`);
  console.log(`${Object.keys(ENDPOINTS).length} endpoints available`);
  console.log(`Wallet: ${account.address}`);
});
