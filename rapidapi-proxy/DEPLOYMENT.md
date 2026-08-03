# 🚀 Deploy Alien Plugg on RapidAPI — Step by Step

## What You're Building

```
RapidAPI User  →  RapidAPI (billing, keys, docs)  →  Your Proxy on Render  →  Bankr x402 Endpoints
                                                        ↓
                                               Pays USDC on Base automatically
```

Users pay a RapidAPI subscription ($0/$9/$29/$99/mo). Your proxy pays per-call x402 fees (~$0.002-$0.25 USDC). You keep the spread.

---

## Step 1: Generate a Proxy Wallet

You need a separate EVM wallet to pay x402 fees. This is NOT your Bankr wallet.

**Option A — MetaMask (easiest):**
1. Open MetaMask → Create new account
2. Switch to Base network
3. Copy the wallet address
4. Export the private key (Account details → Export private key)

**Option B — Command line:**
```bash
node -e "const { privateKeyToAccount } = require('viem/accounts'); const a = privateKeyToAccount(Math.random().toString(16).slice(2).padStart(64,'0')); console.log('Address:', a.address); console.log('Private key: 0x' + a.sourceKey || 'export from MetaMask')"
```

## Step 2: Fund the Proxy Wallet

Send **$20 USDC** (on Base, not Ethereum mainnet) to the proxy wallet address.

- USDC contract on Base: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- Get USDC on Base by bridging from Ethereum or buying on a DEX
- $20 covers ~2,000 API calls at average $0.01/call

## Step 3: Deploy the Proxy on Render

1. Go to **https://render.com** → Sign up (free, GitHub login)
2. Click **New +** → **Web Service**
3. Connect your GitHub repo: `michaelhutchings626-hub/alien-plugg-x402`
4. Settings:
   - **Name:** alien-plugg-proxy
   - **Root Directory:** `rapidapi-proxy`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. Add Environment Variables:
   - `PROXY_WALLET_PRIVATE_KEY` = `0x...` (your proxy wallet's private key)
   - `ADMIN_KEY` = `any-random-password-here` (for admin endpoints)
6. Click **Create Web Service**
7. Wait for deployment (~2-3 minutes)
8. Copy your Render URL: `https://alien-plugg-proxy.onrender.com`

## Step 4: Test the Proxy

```bash
# Health check
curl https://alien-plugg-proxy.onrender.com/

# List endpoints
curl https://alien-plugg-proxy.onrender.com/endpoints

# Test a free call (gas tracker = $0.002)
curl "https://alien-plugg-proxy.onrender.com/api?endpoint=gas-tracker" \
  -H "x-rapidapi-key: test-key"

# Check proxy wallet balance
curl "https://alien-plugg-proxy.onrender.com/admin/balance" \
  -H "x-admin-key: your-admin-password"
```

## Step 5: List on RapidAPI

1. Go to **https://rapidapi.com/studio** → Sign up / Log in
2. Click **Add API Project** (top right)
3. Fill in:
   - **Name:** Alien Plugg — Crypto & Stock Token API
   - **Description:** 32 endpoints for Robinhood Chain stock tokens (NVDA, AAPL, TSLA), Zora crypto analysis, and on-chain intelligence
   - **Category:** Finance / Cryptocurrency
   - **Import data from:** Select "OpenAPI"
   - Upload the file: `rapidapi-proxy/rapidapi-openapi.yaml`
4. After import, go to **Hub Listing → Gateway Tab**:
   - Set **Base URL** to your Render URL: `https://alien-plugg-proxy.onrender.com`
5. Go to **Hub Listing → Definitions Tab**:
   - Verify all endpoints imported correctly
   - Test the `/api` endpoint with different `endpoint` parameters
6. Go to **Hub Listing → Monetize Tab**:
   - Set up pricing tiers:

| Tier | Price/mo | Calls | Description |
|------|----------|-------|-------------|
| Free | $0 | 100 | Try it out — enough for testing |
| Basic | $9 | 1,000 | For individual developers |
| Pro | $29 | 5,000 | For active traders/agents |
| Mega | $99 | 20,000 | For enterprise/bots |

7. Go to **Hub Listing → General Tab**:
   - Add a description, tags, logo
   - Set long description with endpoint categories
   - Add links: GitHub repo, landing page
8. Click **Publish** — your API goes live on RapidAPI!

## Step 6: Monitor & Maintain

- **Check proxy balance weekly:** `GET /admin/balance`
- **Top up USDC when balance drops below $5**
- **View earnings on RapidAPI dashboard**
- **RapidAPI pays out via PayPal** (takes 20% cut of subscription revenue)

## Revenue Math

| RapidAPI Tier | Users | Revenue/mo | x402 Cost | Profit |
|--------------|-------|-----------|-----------|--------|
| 10 Basic users | 10 | $90 | ~$10 | ~$62* |
| 5 Pro users | 5 | $145 | ~$25 | ~$91* |
| 2 Mega users | 2 | $198 | ~$40 | ~$119* |

*After RapidAPI's 20% cut

## Files in This Repo

- `rapidapi-proxy/server.js` — The proxy server (Express + x402)
- `rapidapi-proxy/package.json` — Dependencies
- `rapidapi-proxy/rapidapi-openapi.yaml` — OpenAPI spec for RapidAPI import
- `rapidapi-proxy/README.md` — This guide
