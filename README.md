# 👽 Alien Plugg x402 API SDK

[![x402 Enabled](https://img.shields.io/badge/x402-Enabled-blue.svg)](https://x402.org)
[![Base Network](https://img.shields.io/badge/Network-Base%20(EIP--155%3A8453)-blue)](https://base.org)
[![USDC Payment](https://img.shields.io/badge/Payment-USDC-green)](https://circle.com/usdc)
[![MCP Protocol](https://img.shields.io/badge/MCP-2024--11--05-purple)](https://modelcontextprotocol.io)

> *"What I have is outta this world 👽🌌"*

Welcome to the **Alien Plugg x402 API SDK**. Alien Plugg operates **30 pay-per-call x402 API endpoints** and a Model Context Protocol (MCP) server on the **Base network** (Chain ID `8453`). Built specifically for AI agents, trading bots, and Web3 developers, every endpoint is monetized natively using the open [x402 protocol](https://x402.org) with USDC payments.

---

## ⚡ Quick Start (Time to First "Hello World" < 60s)

No API keys or registration required. You only pay micro-fractions of USDC per request via your EVM wallet.

### 1. Free Endpoint Discovery (0 Seconds Setup)

Fetch the live catalog of all available endpoints in less than 5 seconds:

```bash
curl -s https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/discovery
```

### 2. Make Your First Paid Request (< 60 Seconds)

To make pay-per-call requests, use any x402-compatible SDK (`coinbase` for Python or `@coinbase/x402` for Node.js):

#### Python Quickstart
```python
from coinbase import x402
import os

# Initialize client with your Base wallet private key
client = x402.Client(
    private_key=os.getenv("EVM_PRIVATE_KEY"),
    chain_id=8453 # Base
)

# Call gas-tracker ($0.002) - x402 automatically handles the HTTP 402 handshake & payment
response = client.get("https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/gas-tracker")
print(response.json())
```

---

## 📋 Full API Endpoint Catalog (30 Endpoints)

Base URL: `https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/`

### 1. Crypto & Trading
| Endpoint | Price (USDC) | Description |
| :--- | :--- | :--- |
| `zora-scanner` | `$0.010` | Trending Zora coins + BUY / SELL / STRONG_BUY trading signals |
| `robinhood-scanner` | `$0.010` | Robinhood Chain trending tokens + momentum signals |
| `zora-rug-check` | `$0.020` | Rug risk scoring (0-100) + LOW/MEDIUM/HIGH/CRITICAL verdict |
| `zora-portfolio` | `$0.005` | Wallet token holdings, PnL tracking, and asset allocation |
| `zora-sentiment` | `$0.050` | Social sentiment scoring + ACCUMULATE/HOLD/REDUCE recommendations |
| `token-price` | `$0.015` | Real-time token pricing lookup by ID, symbol, or contract address |
| `token-compare` | `$0.005` | Side-by-side token comparison + automated winner verdict |
| `chart-roast` | `$0.008` | Brutal technical chart analysis + market breakdown |
| `alien-plugg-alpha` | `$0.050` | Daily curated trading signals — top alpha picks, rug warnings, DCA strategies |
| `honeypot-check` | `$0.040` | On-chain honeypot detection — tests buy/sell tax & execute rights |
| `price-alerts` | `$0.008` | Token price alert trigger management & state tracking |

### 2. On-Chain Analysis & Forensics
| Endpoint | Price (USDC) | Description |
| :--- | :--- | :--- |
| `whale-tracker` | `$0.080` | Real-time whale transfer detection on Base network |
| `wallet-profile` | `$0.003` | On-chain wallet profiler + behavioral labels & historical activity |
| `smart-money` | `$0.080` | Track smart money wallets, accumulation patterns, and DEX flow |
| `dex-flow` | `$0.120` | Uniswap V3 liquidity flow & volume depth analysis |
| `new-launches` | `$0.010` | Fresh token launch scanner on Zora & Base |
| `creator-lookup` | `$0.010` | Token creator profile analysis + portfolio of launched coins |
| `gas-tracker` | `$0.002` | Real-time Base network gas prices & fee estimates |
| `tx-status` | `$0.002` | Transaction execution status & receipt parser |
| `holder-analysis` | `$0.030` | Token holder concentration, distribution, and Gini coefficient |

### 3. Web & Utility Tools
| Endpoint | Price (USDC) | Description |
| :--- | :--- | :--- |
| `translate` | `$0.005` | Multi-language translation API supporting 100+ languages |
| `ip-info` | `$0.0015` | IP geolocation, ISP detection, and VPN/proxy flags |
| `expand-url` | `$0.015` | URL shortener expansion & HTTP redirect chain tracer |
| `tech-stack-detect` | `$0.008` | Website technology stack fingerprinting |
| `webpage-diff` | `$0.030` | Webpage content change monitoring + visual diff |
| `builder-score` | `$0.008` | AI-powered developer & builder reputation score |

### 4. Discovery & Protocol Handshake
| Endpoint | Price (USDC) | Description |
| :--- | :--- | :--- |
| `discovery` | **`FREE`** | Full catalog of endpoints, prices, descriptions, and token metadata |
| `.well-known/x402.json` | **`FREE`** | Standard x402 service discovery manifest |
| `mcp-server` / `mcpHandshake` | `$0.005` | Model Context Protocol (MCP) server providing 10 curated tools for AI agents |
| `health` | **`FREE`** | Gateway health check and service latency metric |

---

## 💻 Code Examples

Complete script examples are located in the [`examples/`](./examples/) folder.

### cURL (`examples/curl.sh`)

```bash
# 1. Discover endpoints (FREE)
curl -s https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/discovery

# 2. Call gas-tracker ($0.002) with x402 payment header
curl -s -H "X-PAYMENT: <x402-payment-signature>" \
  https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/gas-tracker

# 3. Call daily trading signals ($0.05)
curl -s -H "X-PAYMENT: <x402-payment-signature>" \
  https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/alien-plugg-alpha
```

### Python (`examples/python.py`)

```python
import os
import json
from coinbase import x402

# Initialize Coinbase x402 client
x402_client = x402.Client(
    private_key=os.getenv("EVM_PRIVATE_KEY"),
    chain_id=8453
)

# 1. Free endpoint discovery
discovery_data = x402_client.get("https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/discovery").json()

# 2. Call gas-tracker ($0.002)
gas_data = x402_client.get("https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/gas-tracker").json()

# 3. Fetch Alien Plugg Alpha Daily Report ($0.05)
alpha_report = x402_client.get("https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/alien-plugg-alpha").json()
```

### Node.js (`examples/nodejs.js`)

```javascript
import { x402Client } from "@coinbase/x402";

const client = new x402Client({
  privateKey: process.env.EVM_PRIVATE_KEY,
  chainId: 8453
});

// 1. Discover endpoints
const discovery = await fetch("https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/discovery").then(r => r.json());

// 2. Call paid gas-tracker endpoint ($0.002)
const gasResponse = await client.fetch("https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/gas-tracker");
const gasData = await gasResponse.json();

// 3. Fetch Alien Plugg Alpha signals ($0.05)
const alphaResponse = await client.fetch("https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/alien-plugg-alpha");
const alphaData = await alphaResponse.json();
```

---

## 🤖 MCP Server Setup for AI Agents

Alien Plugg provides a Model Context Protocol (MCP) server exposing 10 interactive tools for LLM platforms like Claude Desktop, Cursor, and custom agentic frameworks.

**MCP Server Endpoint URL:**
`https://base44.app/api/apps/6a5fdd57651262e86b24133e/functions/mcpHandshake`

### 1. Claude Desktop Setup

Add the following to your `claude_desktop_config.json` file:
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "alien-plugg": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-fetch",
        "https://base44.app/api/apps/6a5fdd57651262e86b24133e/functions/mcpHandshake"
      ]
    }
  }
}
```

### 2. Cursor IDE Setup

Add the configuration in Cursor **Settings -> Features -> MCP** or in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "alien-plugg": {
      "url": "https://base44.app/api/apps/6a5fdd57651262e86b24133e/functions/mcpHandshake",
      "transport": "http"
    }
  }
}
```

---

## 🔗 Official Links & Resources

- 🛰️ **API Base URL:** [`https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/`](https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/)
- 🔍 **Discovery Endpoint:** [`https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/discovery`](https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/discovery)
- 🌐 **Landing Page:** [Alien Plugg Web Portal](https://base44.app/api/apps/6a5fdd57651262e86b24133e/files/mp/public/6a5fdd57651262e86b24133e/1a205d56c_landing-page.html)
- 📄 **llms.txt Specification:** [Alien Plugg llms.txt](https://base44.app/api/apps/6a5fdd57651262e86b24133e/files/mp/public/6a5fdd57651262e86b24133e/defdb7edc_llms.txt)
- 🤖 **MCP Handshake URL:** [`https://base44.app/api/apps/6a5fdd57651262e86b24133e/functions/mcpHandshake`](https://base44.app/api/apps/6a5fdd57651262e86b24133e/functions/mcpHandshake)

### 🪙 Token Contracts

- **PLUGG on Base Network:** [`0xDe76415CeBe959CF0738e8A636d9153fF295bba3`](https://bankr.bot/launches/0xDe76415CeBe959CF0738e8A636d9153fF295bba3)
- **PLUGG on Robinhood Chain:** [`0x09d56eaCb69E85Dca856B6dc15fA6aE9eeaBFBa3`](https://bankr.bot/launches/0x09d56eaCb69E85Dca856B6dc15fA6aE9eeaBFBa3)

---

## 📄 License

MIT License. Built for the open AI agent ecosystem.
