import express from "express";
import cors from "cors";
import { wrapFetchWithPayment, x402HTTPClient } from "@x402/fetch";
import { x402Client } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const BANKR_BASE = "https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d";

// Create x402 client with wallet signer
const signer = privateKeyToAccount(process.env.PROXY_WALLET_PRIVATE_KEY);
const client = new x402Client();
client.register("eip155:*", new ExactEvmScheme(signer));

// Wrap fetch to auto-handle 402 payments
const fetchWithPayment = wrapFetchWithPayment(fetch, client);
const httpClient = new x402HTTPClient(client);

// Endpoint catalog — maps RapidAPI-friendly names to Bankr x402 paths
const ENDPOINTS = {
  // === Crypto Analysis ===
  "zora-scanner":       "/zora-scanner",
  "robinhood-scanner":  "/robinhood-scanner",
  "rug-check":          "/zora-rug-check",
  "honeypot-check":     "/honeypot-check",
  "holder-analysis":    "/holder-analysis",
  "sentiment":          "/zora-sentiment",
  "portfolio":          "/zora-portfolio",
  "token-price":        "/token-price",
  "token-compare":      "/token-compare",
  "chart-roast":        "/chart-roast",
  "new-launches":       "/new-launches",
  "creator-lookup":     "/creator-lookup",

  // === On-Chain ===
  "whale-tracker":      "/whale-tracker",
  "smart-money":        "/smart-money",
  "dex-flow":           "/dex-flow",
  "wallet-profile":     "/wallet-profile",
  "gas-tracker":        "/gas-tracker",
  "tx-status":          "/tx-status",
  "builder-score":      "/builder-score",

  // === Utilities ===
  "translate":          "/translate",
  "ip-info":            "/ip-info",
  "expand-url":         "/expand-url",
  "tech-stack":         "/tech-stack-detect",
  "webpage-diff":       "/webpage-diff",

  // === Premium ===
  "daily-alpha":        "/alien-plugg-alpha",
  "pro-alpha":          "/alien-plugg-pro-alpha",
  "whale-alert":        "/whale-alert",
  "rug-alert":          "/rug-alert",
  "launch-alert":       "/launch-alert",
  "price-alerts":       "/price-alerts",
};

// === Rate limiting per API key (in-memory, resets on restart) ===
const usage = new Map(); // key -> { count, resetTime }

const TIERS = {
  free:       { monthly: 10,   label: "Free" },
  basic:      { monthly: 100,  label: "Basic" },
  pro:        { monthly: 500,  label: "Pro" },
  enterprise: { monthly: 2000, label: "Enterprise" },
};

function checkRateLimit(apiKey) {
  const now = Date.now();
  const monthMs = 30 * 24 * 60 * 60 * 1000;
  
  if (!usage.has(apiKey)) {
    usage.set(apiKey, { count: 0, resetTime: now + monthMs });
  }
  
  const record = usage.get(apiKey);
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + monthMs;
  }
  
  return record;
}

// === Routes ===

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "Alien Plugg x402 Proxy", endpoints: Object.keys(ENDPOINTS).length });
});

// List available endpoints (RapidAPI discovery)
app.get("/endpoints", (req, res) => {
  res.json({
    endpoints: Object.keys(ENDPOINTS).map(name => ({
      name,
      path: `/${name}`,
      method: "GET",
      description: `Alien Plugg: ${name}`,
    })),
    total: Object.keys(ENDPOINTS).length,
  });
});

// Main proxy endpoint — accepts ?endpoint=<name>&<extra params>
app.get("/api", async (req, res) => {
  const rapidApiKey = req.headers["x-rapidapi-key"] || req.headers["x-rapidapi-proxy-secret"];
  
  if (!rapidApiKey) {
    return res.status(401).json({ error: "Missing RapidAPI key" });
  }

  const endpointName = req.query.endpoint;
  if (!endpointName || !ENDPOINTS[endpointName]) {
    return res.status(400).json({
      error: "Invalid or missing endpoint parameter",
      available: Object.keys(ENDPOINTS),
      usage: "GET /api?endpoint=<name>&<params>",
    });
  }

  // Rate limiting
  const usage_record = checkRateLimit(rapidApiKey);
  if (usage_record.count >= TIERS.free.monthly) {
    // In production, tier would be looked up from RapidAPI subscription
    return res.status(429).json({
      error: "Monthly limit exceeded",
      used: usage_record.count,
      limit: TIERS.free.monthly,
      reset: new Date(usage_record.resetTime).toISOString(),
    });
  }

  const targetPath = ENDPOINTS[endpointName];
  
  // Forward query params (except 'endpoint') to the x402 endpoint
  const forwardParams = { ...req.query };
  delete forwardParams.endpoint;
  const queryString = new URLSearchParams(forwardParams).toString();
  const targetUrl = queryString
    ? `${BANKR_BASE}${targetPath}?${queryString}`
    : `${BANKR_BASE}${targetPath}`;

  try {
    // Make the x402 paid request — payment handled automatically
    const response = await fetchWithPayment(targetUrl, {
      method: "GET",
      headers: { "Accept": "application/json" },
    });

    // Process the x402 response
    const result = await httpClient.processResponse(response);

    if (result.paymentStatus === "settled") {
      usage_record.count++;
      console.log(`[${new Date().toISOString()}] ${endpointName} — settled — key=${rapidApiKey.slice(0, 8)}...`);
    }

    res.status(response.status).json({
      endpoint: endpointName,
      payment: result.paymentStatus,
      data: result.body,
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] ERROR ${endpointName}:`, error.message);
    res.status(502).json({
      error: "x402 payment or fetch failed",
      message: error.message,
      endpoint: endpointName,
    });
  }
});

// POST support for endpoints that need body params
app.post("/api", async (req, res) => {
  const rapidApiKey = req.headers["x-rapidapi-key"] || req.headers["x-rapidapi-proxy-secret"];
  
  if (!rapidApiKey) {
    return res.status(401).json({ error: "Missing RapidAPI key" });
  }

  const endpointName = req.query.endpoint || req.body.endpoint;
  if (!endpointName || !ENDPOINTS[endpointName]) {
    return res.status(400).json({ error: "Invalid endpoint", available: Object.keys(ENDPOINTS) });
  }

  const usage_record = checkRateLimit(rapidApiKey);
  if (usage_record.count >= TIERS.free.monthly) {
    return res.status(429).json({ error: "Monthly limit exceeded" });
  }

  const targetPath = ENDPOINTS[endpointName];
  const targetUrl = `${BANKR_BASE}${targetPath}`;

  try {
    const response = await fetchWithPayment(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(req.body),
    });

    const result = await httpClient.processResponse(response);
    if (result.paymentStatus === "settled") usage_record.count++;

    res.status(response.status).json({
      endpoint: endpointName,
      payment: result.paymentStatus,
      data: result.body,
    });

  } catch (error) {
    console.error("POST proxy error:", error.message);
    res.status(502).json({ error: "x402 proxy failed", message: error.message });
  }
});

// Wallet balance check (for monitoring)
app.get("/admin/balance", (req, res) => {
  const adminKey = req.headers["x-admin-key"];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }
  res.json({
    wallet: signer.address,
    note: "Check USDC balance on Base for this address",
    usage_today: Array.from(usage.entries()).reduce((sum, [k, v]) => sum + v.count, 0),
  });
});

app.listen(PORT, () => {
  console.log(`Alien Plugg x402 Proxy running on port ${PORT}`);
  console.log(`Wallet: ${signer.address}`);
  console.log(`Endpoints: ${Object.keys(ENDPOINTS).length}`);
});
