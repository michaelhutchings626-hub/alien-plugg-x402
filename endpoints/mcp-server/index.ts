/**
 * Alien Plugg MCP Server — Model Context Protocol server with x402 monetization
 * 
 * This file defines an MCP server that exposes our x402 endpoints as MCP tools
 * that AI agents (Claude, Cursor, etc.) can discover and call. Each tool call
 * routes through our existing x402 endpoints, generating revenue.
 * 
 * 15 tools across 4 categories:
 * Zora: zora_scanner, zora_rug_check, zora_portfolio, honeypot_check, holder_analysis, creator_lookup, new_launches, chart_roast
 * Robinhood Chain: rh_stock_prices, rh_stock_list, rh_corporate_actions, rh_stock_screener, rh_dex_scanner
 * Utilities: token_price, alien_plugg_alpha
 * 
 * The MCP server response follows the MCP protocol spec:
 * https://modelcontextprotocol.io/specification
 */

export default async function handler(req: Request): Promise<Response> {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });

  const BANKR_WALLET = "0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d";
  const BASE_URL = `https://x402.bankr.bot/${BANKR_WALLET}`;

  try {
    const body = await req.json();
    const { jsonrpc, method, params, id } = body;

    switch (method) {
      case "initialize": {
        return Response.json({
          jsonrpc: jsonrpc || "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {}, resources: {}, prompts: {} },
            serverInfo: {
              name: "alien-plugg-mcp",
              version: "2.0.0",
              description: "Alien Plugg's cosmic x402 API toolkit — 15 tools covering Zora crypto, Robinhood Chain stock tokens, and on-chain intelligence. Paid per-request via x402 protocol.",
              author: "alienplugg",
              website: "https://app.base44.com/superagent/6a5fdd57651262e86b24133e",
            },
          },
        }, { status: 200, headers });
      }

      case "tools/list": {
        return Response.json({
          jsonrpc: jsonrpc || "2.0",
          id,
          result: {
            tools: [
              // === Zora Crypto Analysis ===
              {
                name: "zora_scanner",
                description: "✅ Scan Zora for trending coins, price spikes, and trading signals. Returns top movers with market cap, volume, 24h change, and BUY/SELL/STRONG_BUY signals. #zora #crypto #scanner #trending",
                inputSchema: {
                  type: "object",
                  properties: {
                    limit: { type: "number", description: "Max results (default 10, max 50)", default: 10 },
                    sort: { type: "string", description: "Sort by: volume, marketCap, change (default: volume)", default: "volume" },
                  },
                },
                _x402: { url: `${BASE_URL}/zora-scanner`, price: "$0.01 USDC", network: "base" },
              },
              {
                name: "zora_rug_check",
                description: "✅ Rug risk analysis for any Zora coin. Scores holder concentration, liquidity, creator socials, token age, volume, and price dumps. Returns 0-100 risk score with LOW/MEDIUM/HIGH/CRITICAL verdict.",
                inputSchema: {
                  type: "object",
                  properties: {
                    token: { type: "string", description: "Token contract address (0x...)" },
                  },
                  required: ["token"],
                },
                _x402: { url: `${BASE_URL}/zora-rug-check`, price: "$0.02 USDC", network: "base" },
              },
              {
                name: "zora_portfolio",
                description: "✅ Token portfolio snapshot for any Zora wallet. Returns holdings, market values, PnL, allocation breakdown, top gainers and losers.",
                inputSchema: {
                  type: "object",
                  properties: {
                    wallet: { type: "string", description: "Wallet address (0x...)" },
                  },
                  required: ["wallet"],
                },
                _x402: { url: `${BASE_URL}/zora-portfolio`, price: "$0.005 USDC", network: "base" },
              },
              {
                name: "honeypot_check",
                description: "✅ Honeypot detector for Zora/Base tokens. Checks if a token can actually be sold or if it's a trap. Returns 0-100 honeypot score with SAFE/SUSPICIOUS/HONEYPOT verdict.",
                inputSchema: {
                  type: "object",
                  properties: {
                    token: { type: "string", description: "Token contract address (0x...)" },
                  },
                  required: ["token"],
                },
                _x402: { url: `${BASE_URL}/honeypot-check`, price: "$0.04 USDC", network: "base" },
              },
              {
                name: "holder_analysis",
                description: "✅ Deep dive into any Zora token's holder base. Top 10 holders, concentration metrics (top 1%/5%/10%), Gini coefficient, and distribution health rating.",
                inputSchema: {
                  type: "object",
                  properties: {
                    token: { type: "string", description: "Token contract address (0x...)" },
                  },
                  required: ["token"],
                },
                _x402: { url: `${BASE_URL}/holder-analysis`, price: "$0.03 USDC", network: "base" },
              },
              {
                name: "creator_lookup",
                description: "✅ Look up any Zora creator's profile, their coins, stats, and social accounts. Search by handle or wallet address.",
                inputSchema: {
                  type: "object",
                  properties: {
                    handle: { type: "string", description: "Zora handle (e.g. thenickshirley)" },
                    address: { type: "string", description: "Wallet address (0x...)" },
                  },
                },
                _x402: { url: `${BASE_URL}/creator-lookup`, price: "$0.01 USDC", network: "base" },
              },
              {
                name: "new_launches",
                description: "✅ Newest Zora token launches. Returns the freshest coins with market cap, volume, holders, creator info, and age labels. Perfect for sniping new gems.",
                inputSchema: {
                  type: "object",
                  properties: {
                    limit: { type: "number", description: "Max results (default 10)", default: 10 },
                  },
                },
                _x402: { url: `${BASE_URL}/new-launches`, price: "$0.01 USDC", network: "base" },
              },
              {
                name: "chart_roast",
                description: "✅ Roasts any crypto token's chart with brutal honesty. Technical analysis with support/resistance, trend direction, volume ratio, liquidity score, and a savage roast verdict.",
                inputSchema: {
                  type: "object",
                  properties: {
                    token: { type: "string", description: "Token contract address (0x...)" },
                  },
                  required: ["token"],
                },
                _x402: { url: `${BASE_URL}/chart-roast`, price: "$0.008 USDC", network: "base" },
              },

              // === Robinhood Chain Stock Tokens (NEW) ===
              {
                name: "rh_stock_prices",
                description: "✅ Live stock token prices on Robinhood Chain. Get real-time bid/ask for 90+ tokenized stocks (NVDA, AAPL, GOOGL, TSLA, MSFT). Returns raw prices, multiplier-adjusted token prices, daily volume, and trading halt status. #robinhood #stocks #prices #NVDA #AAPL #tokenized",
                inputSchema: {
                  type: "object",
                  properties: {
                    symbol: { type: "string", description: "Stock symbol (e.g. NVDA, AAPL). Omit for all stocks." },
                  },
                },
                _x402: { url: `${BASE_URL}/rh-stock-prices`, price: "$0.02 USDC", network: "base" },
              },
              {
                name: "rh_stock_list",
                description: "✅ Full catalog of 90+ Robinhood Chain stock tokens with contract addresses, multipliers, trading status, and capabilities. Filter by symbol, name, or tradability. #robinhood #stocks #tokens #catalog #directory",
                inputSchema: {
                  type: "object",
                  properties: {
                    filter: { type: "string", description: "Filter by symbol or name" },
                    tradable: { type: "string", description: "Set to 'true' for only fractional-tradable tokens" },
                  },
                },
                _x402: { url: `${BASE_URL}/rh-stock-list`, price: "$0.01 USDC", network: "base" },
              },
              {
                name: "rh_corporate_actions",
                description: "✅ Corporate actions for Robinhood Chain stock tokens. Track splits, dividends, mergers, and spin-offs affecting tokenized stock holders. Critical for understanding multiplier changes. #robinhood #corporate #actions #splits #dividends",
                inputSchema: {
                  type: "object",
                  properties: {
                    symbol: { type: "string", description: "Filter by stock symbol" },
                    type: { type: "string", description: "Filter by type (split, dividend, merger)" },
                  },
                },
                _x402: { url: `${BASE_URL}/rh-corporate-actions`, price: "$0.03 USDC", network: "base" },
              },
              {
                name: "rh_stock_screener",
                description: "✅ Screen and rank Robinhood Chain stock tokens by volume, spread, or price. Filter by minimum volume, tradability, extended hours, and all-day trading. Find the most liquid tokenized stocks. #robinhood #stocks #screener #volume #liquidity",
                inputSchema: {
                  type: "object",
                  properties: {
                    minVolume: { type: "number", description: "Minimum daily volume threshold" },
                    sort: { type: "string", description: "Sort by: volume, spread, price", default: "volume" },
                    limit: { type: "number", description: "Max results (default 20)", default: 20 },
                    extendedHours: { type: "string", description: "Set to 'true' for extended-hours only" },
                    allDay: { type: "string", description: "Set to 'true' for 24/5 tradable only" },
                  },
                },
                _x402: { url: `${BASE_URL}/rh-stock-screener`, price: "$0.02 USDC", network: "base" },
              },
              {
                name: "rh_dex_scanner",
                description: "✅ Robinhood Chain block and DEX activity scanner. Scans recent blocks for transaction counts, gas prices, and utilization. Covers Uniswap v4 DEX infrastructure on chain ID 4663. #robinhood #dex #blocks #gas #uniswap",
                inputSchema: {
                  type: "object",
                  properties: {
                    blocks: { type: "number", description: "Number of recent blocks to scan (default 5, max 50)", default: 5 },
                  },
                },
                _x402: { url: `${BASE_URL}/rh-dex-scanner`, price: "$0.02 USDC", network: "base" },
              },

              // === Utilities ===
              {
                name: "token_price",
                description: "✅ Crypto token price API powered by CoinGecko. Lookup by id (bitcoin), symbol (BTC), or contract address. Returns USD price, 24h/7d change, market cap, volume, supply, ATH, ATL.",
                inputSchema: {
                  type: "object",
                  properties: {
                    query: { type: "string", description: "Token id, symbol, or contract address" },
                  },
                  required: ["query"],
                },
                _x402: { url: `${BASE_URL}/token-price`, price: "$0.015 USDC", network: "base" },
              },
              {
                name: "alien_plugg_alpha",
                description: "✅ Premium daily curated trading signals from Alien Plugg. Returns top 5 picks, 3 newest launches, rug warnings, market summary, and DCA recommendation. The cosmic pharmacist's daily brief.",
                inputSchema: {
                  type: "object",
                  properties: {
                    detailed: { type: "boolean", description: "Include extended analysis per coin", default: false },
                  },
                },
                _x402: { url: `${BASE_URL}/alien-plugg-alpha`, price: "$0.05 USDC", network: "base" },
              },
            ],
          },
        }, { status: 200, headers });
      }

      case "tools/call": {
        const toolName = params?.name;
        const toolArgs = params?.arguments || {};
        const x402Url = getToolUrl(toolName, BASE_URL);

        if (!x402Url) {
          return Response.json({
            jsonrpc: jsonrpc || "2.0",
            id,
            error: { code: -32601, message: `Unknown tool: ${toolName}` },
          }, { status: 200, headers });
        }

        const queryParams = new URLSearchParams();
        for (const [key, value] of Object.entries(toolArgs)) {
          if (value !== undefined && value !== null) queryParams.append(key, String(value));
        }
        const fullUrl = queryParams.toString() ? `${x402Url}?${queryParams}` : x402Url;

        const apiRes = await fetch(fullUrl, {
          method: "GET",
          headers: { "Accept": "application/json" },
        });

        if (apiRes.status === 402) {
          const paymentReq = await apiRes.json();
          return Response.json({
            jsonrpc: jsonrpc || "2.0",
            id,
            result: {
              content: [{
                type: "text",
                text: `Payment required: ${JSON.stringify(paymentReq.accepts?.[0] || paymentReq)}`,
              }],
              _x402: { paymentRequired: true, accepts: paymentReq.accepts },
            },
          }, { status: 200, headers });
        }

        const data = await apiRes.text();
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = { raw: data }; }

        return Response.json({
          jsonrpc: jsonrpc || "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(parsed, null, 2) }],
          },
        }, { status: 200, headers });
      }

      case "resources/list": {
        return Response.json({
          jsonrpc: jsonrpc || "2.0",
          id,
          result: {
            resources: [{
              uri: "alien-plugg://endpoints",
              name: "All Alien Plugg Endpoints",
              description: "Complete catalog of 32 x402 paid API endpoints",
              mimeType: "application/json",
            }],
          },
        }, { status: 200, headers });
      }

      case "resources/read": {
        const uri = params?.uri;
        if (uri === "alien-plugg://endpoints") {
          return Response.json({
            jsonrpc: jsonrpc || "2.0",
            id,
            result: {
              contents: [{
                uri: "alien-plugg://endpoints",
                mimeType: "application/json",
                text: JSON.stringify({
                  total: 32,
                  categories: {
                    "Robinhood Chain Stock Tokens": ["rh-stock-prices", "rh-stock-list", "rh-corporate-actions", "rh-stock-screener", "rh-dex-scanner"],
                    "Zora Crypto Analysis": ["zora-scanner", "zora-rug-check", "zora-portfolio", "zora-sentiment", "honeypot-check", "holder-analysis", "creator-lookup", "new-launches", "chart-roast"],
                    "On-Chain Intelligence": ["token-price", "whale-tracker", "smart-money", "wallet-profile", "dex-flow", "gas-tracker", "tx-status", "builder-score"],
                    "Utilities": ["translate", "ip-info", "expand-url", "tech-stack-detect", "webpage-diff", "price-alerts"],
                    "Premium Alpha": ["alien-plugg-alpha", "alien-plugg-pro-alpha"],
                  },
                  mcpServer: `${BASE_URL}/mcp-server`,
                  discovery: `${BASE_URL}/discovery`,
                  tokens: [
                    { symbol: "PLUGG", chain: "base", address: "0xDe76415CeBe959CF0738e8A636d9153fF295bba3" },
                    { symbol: "PLUGG", chain: "robinhood", address: "0x09d56eaCb69E85Dca856B6dc15fA6aE9eeaBFBa3" },
                  ],
                }, null, 2),
              }],
            },
          }, { status: 200, headers });
        }
        return Response.json({
          jsonrpc: jsonrpc || "2.0", id,
          error: { code: -32601, message: `Unknown resource: ${uri}` },
        }, { status: 200, headers });
      }

      case "ping": {
        return Response.json({ jsonrpc: jsonrpc || "2.0", id, result: {} }, { status: 200, headers });
      }

      default:
        return Response.json({
          jsonrpc: jsonrpc || "2.0", id,
          error: { code: -32601, message: `Method not found: ${method}` },
        }, { status: 200, headers });
    }
  } catch (error) {
    return Response.json({
      jsonrpc: "2.0", id: body?.id || null,
      error: { code: -32603, message: error instanceof Error ? error.message : "Internal error" },
    }, { status: 200, headers });
  }
}

function getToolUrl(name: string, baseUrl: string): string | null {
  const map: Record<string, string> = {
    "zora_scanner": `${baseUrl}/zora-scanner`,
    "zora_rug_check": `${baseUrl}/zora-rug-check`,
    "zora_portfolio": `${baseUrl}/zora-portfolio`,
    "honeypot_check": `${baseUrl}/honeypot-check`,
    "holder_analysis": `${baseUrl}/holder-analysis`,
    "creator_lookup": `${baseUrl}/creator-lookup`,
    "new_launches": `${baseUrl}/new-launches`,
    "chart_roast": `${baseUrl}/chart-roast`,
    "rh_stock_prices": `${baseUrl}/rh-stock-prices`,
    "rh_stock_list": `${baseUrl}/rh-stock-list`,
    "rh_corporate_actions": `${baseUrl}/rh-corporate-actions`,
    "rh_stock_screener": `${baseUrl}/rh-stock-screener`,
    "rh_dex_scanner": `${baseUrl}/rh-dex-scanner`,
    "token_price": `${baseUrl}/token-price`,
    "alien_plugg_alpha": `${baseUrl}/alien-plugg-alpha`,
  };
  return map[name] || null;
}
