/**
 * alien-plugg-discovery — Free endpoint that returns the full catalog
 * AI agents can discover all endpoints, prices, and the MCP server URL
 * without paying. This is the entry point for agent onboarding.
 */
export default async function handler(req: Request): Promise<Response> {
  const headers = {
    "Access-Control-Allow-Origin": "*",
  };

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });

  const url = new URL(req.url);
  const format = url.searchParams.get("format") || "json";

  if (format === "llms") {
    return new Response(`# Alien Plugg — x402 API Endpoints for AI Agents

> What I have is outta this world 👽🌌

32 paid x402 API endpoints + MCP server with 10 tools. USDC on Base.

## Categories
- Robinhood Chain Stock Tokens (5 endpoints) — tokenized stock prices, catalog, screener, corporate actions, DEX scanner
- Zora Crypto Analysis (12 endpoints) — scanner, rug check, sentiment, portfolio, holders, honeypot, creator lookup
- On-Chain Intelligence (7 endpoints) — whale tracker, smart money, DEX flow, wallet profile, gas, tx status, builder score
- Utilities (6 endpoints) — translate, IP info, URL expansion, tech stack, webpage diff, price alerts
- Premium Alpha (2 endpoints) — daily curated trading signals + pro tier

## MCP Server
POST https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/mcp-server

## Robinhood Chain Stock Tokens (NEW)
- rh-stock-prices ($0.02) — Live bid/ask for 90+ tokenized stocks (NVDA, AAPL, TSLA)
- rh-stock-list ($0.01) — Full catalog with contract addresses + trading capabilities
- rh-corporate-actions ($0.03) — Splits, dividends, mergers for stock tokens
- rh-stock-screener ($0.02) — Screen/rank by volume, tradability, extended hours
- rh-dex-scanner ($0.02) — Block activity, gas, tx counts on chain ID 4663

## Endpoints (base: https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/)
- zora-scanner ($0.01) — Trending coins + signals
- robinhood-scanner ($0.01) — Robinhood Chain tokens
- zora-rug-check ($0.02) — Rug risk score
- zora-portfolio ($0.005) — Wallet PnL
- honeypot-check ($0.04) — Honeypot detector
- holder-analysis ($0.03) — Holder concentration
- alien-plugg-alpha ($0.05) — Daily curated alpha
- token-price ($0.015) — CoinGecko prices
- chart-roast ($0.008) — Chart analysis
- new-launches ($0.01) — Fresh launches
- creator-lookup ($0.01) — Creator profiles
- whale-tracker ($0.08) — Whale detection
- smart-money ($0.08) — Smart money tracking
- + 19 more endpoints

## Tokens
- PLUGG on Base: 0xDe76415CeBe959CF0738e8A636d9153fF295bba3
- PLUGG on Robinhood: 0x09d56eaCb69E85Dca856B6dc15fA6aE9eeaBFBa3`, {
      status: 200,
      headers: { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*" },
    });
  }

  return Response.json({
    name: "Alien Plugg x402 API",
    description: "32 paid x402 API endpoints for Robinhood Chain stock tokens, Zora crypto analysis, and on-chain intelligence. MCP server with 10 tools for AI agents.",
    wallet: "0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d",
    network: "base",
    currency: "USDC",
    totalEndpoints: 32,
    mcpServer: "https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/mcp-server",
    mcpTools: 10,
    baseUrl: "https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/",
    landingPage: "https://base44.app/api/apps/6a5fdd57651262e86b24133e/files/mp/public/6a5fdd57651262e86b24133e/1a205d56c_landing-page.html",
    categories: {
      "Robinhood Chain Stock Tokens": 5,
      "Zora Crypto Analysis": 12,
      "On-Chain Intelligence": 7,
      "Utilities": 6,
      "Premium Alpha": 2,
    },
    tokens: [
      { symbol: "PLUGG", chain: "base", address: "0xDe76415CeBe959CF0738e8A636d9153fF295bba3" },
      { symbol: "PLUGG", chain: "robinhood", address: "0x09d56eaCb69E85Dca856B6dc15fA6aE9eeaBFBa3" },
    ],
    endpoints: [
      // Robinhood Chain Stock Tokens (NEW)
      { name: "rh-stock-prices", price: "$0.02", desc: "Live stock token prices (NVDA, AAPL, TSLA)", category: "Robinhood Chain" },
      { name: "rh-stock-list", price: "$0.01", desc: "90+ stock token catalog with addresses", category: "Robinhood Chain" },
      { name: "rh-corporate-actions", price: "$0.03", desc: "Splits, dividends, mergers", category: "Robinhood Chain" },
      { name: "rh-stock-screener", price: "$0.02", desc: "Screen/rank stock tokens", category: "Robinhood Chain" },
      { name: "rh-dex-scanner", price: "$0.02", desc: "Block activity + gas on chain 4663", category: "Robinhood Chain" },
      // Zora Crypto Analysis
      { name: "zora-scanner", price: "$0.01", desc: "Trending coins + signals", category: "Zora" },
      { name: "robinhood-scanner", price: "$0.01", desc: "Robinhood Chain tokens", category: "Zora" },
      { name: "zora-rug-check", price: "$0.02", desc: "Rug risk analysis", category: "Zora" },
      { name: "zora-portfolio", price: "$0.005", desc: "Wallet PnL", category: "Zora" },
      { name: "zora-sentiment", price: "$0.05", desc: "Social sentiment", category: "Zora" },
      { name: "honeypot-check", price: "$0.04", desc: "Honeypot detector", category: "Zora" },
      { name: "holder-analysis", price: "$0.03", desc: "Holder concentration", category: "Zora" },
      { name: "creator-lookup", price: "$0.01", desc: "Creator profiles", category: "Zora" },
      { name: "new-launches", price: "$0.01", desc: "New launches", category: "Zora" },
      { name: "chart-roast", price: "$0.008", desc: "Chart analysis", category: "Zora" },
      // On-Chain Intelligence
      { name: "token-price", price: "$0.015", desc: "CoinGecko prices", category: "On-Chain" },
      { name: "whale-tracker", price: "$0.08", desc: "Whale detection", category: "On-Chain" },
      { name: "smart-money", price: "$0.08", desc: "Smart money tracking", category: "On-Chain" },
      { name: "wallet-profile", price: "$0.003", desc: "Wallet profiler", category: "On-Chain" },
      { name: "dex-flow", price: "$0.12", desc: "DEX liquidity", category: "On-Chain" },
      { name: "gas-tracker", price: "$0.002", desc: "Gas prices", category: "On-Chain" },
      { name: "tx-status", price: "$0.002", desc: "TX status", category: "On-Chain" },
      { name: "builder-score", price: "$0.008", desc: "Builder reputation", category: "On-Chain" },
      // Utilities
      { name: "translate", price: "$0.005", desc: "100+ languages", category: "Utility" },
      { name: "ip-info", price: "$0.0015", desc: "IP geolocation", category: "Utility" },
      { name: "expand-url", price: "$0.015", desc: "URL tracer", category: "Utility" },
      { name: "tech-stack-detect", price: "$0.008", desc: "Tech fingerprinting", category: "Utility" },
      { name: "webpage-diff", price: "$0.03", desc: "Change monitor", category: "Utility" },
      { name: "price-alerts", price: "$0.008", desc: "Price alerts", category: "Utility" },
      // Premium
      { name: "alien-plugg-alpha", price: "$0.05", desc: "Daily alpha", category: "Premium" },
      { name: "alien-plugg-pro-alpha", price: "$0.25", desc: "Pro alpha report", category: "Premium" },
      // MCP
      { name: "mcp-server", price: "$0.005", desc: "MCP server (10 tools)", category: "MCP" },
    ],
    chat: "https://app.base44.com/superagent/6a5fdd57651262e86b24133e",
  }, { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
}
