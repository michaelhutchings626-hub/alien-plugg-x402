# Alien Plugg x402 Proxy for RapidAPI

Translates standard RapidAPI requests into x402 paid calls. Users pay RapidAPI subscriptions; the proxy handles USDC micropayments on the backend.

## Quick Deploy (Render free tier)

1. Go to https://render.com → New → Web Service → Connect this repo
2. Set environment variables:
   - `PROXY_WALLET_PRIVATE_KEY` — EVM wallet private key with USDC on Base
   - `ADMIN_KEY` — any random string for admin access
3. Build command: `npm install`
4. Start command: `npm start`

## Usage

```bash
# List endpoints
curl https://your-proxy.onrender.com/endpoints

# Call an endpoint (RapidAPI adds x-rapidapi-key automatically)
curl "https://your-proxy.onrender.com/api?endpoint=zora-scanner" \
  -H "x-rapidapi-key: YOUR_KEY"

# With parameters
curl "https://your-proxy.onrender.com/api?endpoint=token-price&address=0x123..." \
  -H "x-rapidapi-key: YOUR_KEY"
```

## Architecture

```
RapidAPI User → RapidAPI Proxy → This Server → Bankr x402 Endpoint
                                              ↓
                                    402 Payment Required
                                              ↓
                                    Sign USDC EIP-3009 transfer
                                              ↓
                                    Retry with X-PAYMENT header
                                              ↓
                                    Return data to user
```

## Revenue Model

| RapidAPI Tier | Price/mo | Calls | Our x402 cost | Profit |
|--------------|----------|-------|-------------|--------|
| Free | $0 | 10 | ~$0.10 | -$0.10 |
| Basic | $9 | 100 | ~$1.00 | $6.20 |
| Pro | $29 | 500 | ~$5.00 | $18.20 |
| Enterprise | $99 | 2,000 | ~$20.00 | $59.20 |

*RapidAPI takes 20% of subscription revenue. Our x402 costs are ~$0.01/call avg.*
