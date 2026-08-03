# Alien Plugg x402 API Skill

## Description

Alien Plugg's cosmic x402 API toolkit — 32 paid endpoints covering Robinhood Chain stock tokens, Zora crypto analysis, on-chain intelligence, and utilities. MCP-compatible with 15 curated tools for AI agents. All payments are automatic via the x402 protocol (USDC on Base).

## Installation

```
> install the alien-plugg-x402 skill from https://github.com/BankrBot/skills/tree/main/alien-plugg-x402
```

## Available Tools

### MCP Server (Recommended for AI Agents)

Connect to the MCP server at:

```
https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/mcp-server
```

Implements MCP protocol 2024-11-05: initialize, tools/list, tools/call, resources/list, resources/read.
15 tools: 8 Zora crypto, 5 Robinhood Chain stock tokens, 2 utilities.

### Quick Reference — All 32 Endpoints

Base URL: `https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/`

#### Robinhood Chain Stock Tokens (NEW — unique offering)
| Endpoint | Price | Description |
|----------|-------|-------------|
| rh-stock-prices | $0.02 | Live bid/ask for 90+ tokenized stocks (NVDA, AAPL, TSLA, GOOGL, MSFT) |
| rh-stock-list | $0.01 | Full catalog with contract addresses, multipliers, trading capabilities |
| rh-corporate-actions | $0.03 | Splits, dividends, mergers for stock token holders |
| rh-stock-screener | $0.02 | Screen/rank by volume, tradability, extended hours, all-day trading |
| rh-dex-scanner | $0.02 | Block activity, gas prices, tx counts on chain ID 4663 |

#### Zora Crypto Analysis
| Endpoint | Price | Description |
|----------|-------|-------------|
| zora-scanner | $0.01 | Trending coins + BUY/SELL/STRONG_BUY signals |
| robinhood-scanner | $0.01 | Robinhood Chain trending tokens + signals |
| zora-rug-check | $0.02 | 0-100 rug risk score with verdict |
| zora-portfolio | $0.005 | Wallet holdings, PnL, allocation breakdown |
| zora-sentiment | $0.05 | Social sentiment across Twitter/Farcaster/TikTok |
| honeypot-check | $0.04 | Honeypot/sell-trap detector |
| holder-analysis | $0.03 | Top holders, Gini coefficient, concentration |
| creator-lookup | $0.01 | Creator profiles, coins, social accounts |
| new-launches | $0.01 | Freshest token launches with age labels |
| chart-roast | $0.008 | Technical analysis + brutal chart roasting |
| token-price | $0.015 | CoinGecko prices for any token |
| token-compare | $0.005 | Side-by-side token comparison |

#### On-Chain Intelligence
| Endpoint | Price | Description |
|----------|-------|-------------|
| whale-tracker | $0.08 | Large whale transfer detection on Base |
| smart-money | $0.08 | Smart money wallet tracking |
| dex-flow | $0.12 | Uniswap V3 liquidity flow analysis |
| wallet-profile | $0.003 | ETH/USDC balance, tx count, behavioral label |
| gas-tracker | $0.002 | Gas prices on Base, Ethereum, Arbitrum, Optimism, Polygon |
| tx-status | $0.002 | Transaction confirmation status + gas cost |
| builder-score | $0.008 | AI-powered builder reputation score |

#### Utilities
| Endpoint | Price | Description |
|----------|-------|-------------|
| translate | $0.005 | 100+ languages via Google Translate |
| ip-info | $0.0015 | IP geolocation + proxy/VPN detection |
| expand-url | $0.015 | Follow redirects, resolve final URL |
| tech-stack-detect | $0.008 | Website technology fingerprinting |
| webpage-diff | $0.03 | Monitor webpage changes |
| price-alerts | $0.008 | Set/check price alerts for Zora tokens |

#### Premium Alpha
| Endpoint | Price | Description |
|----------|-------|-------------|
| alien-plugg-alpha | $0.05 | Daily curated picks, signals, rug warnings |
| alien-plugg-pro-alpha | $0.25 | Pro report with RSI, MACD, support/resistance |

#### Discovery (FREE)
| Endpoint | Price | Description |
|----------|-------|-------------|
| discovery | FREE | Full catalog as JSON or llms.txt format |
| mcp-handshake | FREE | MCP protocol handshake + tool discovery |

## Usage Examples

```bash
# Get live NVDA stock token price
curl "https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/rh-stock-prices?symbol=NVDA"

# Scan Zora for trending coins
curl "https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/zora-scanner"

# Check rug risk for a token
curl "https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/zora-rug-check?token=0x..."

# Screen stock tokens by volume
curl "https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/rh-stock-screener?sort=volume&limit=10"
```

## Tokens
- PLUGG on Base: 0xDe76415CeBe959CF0738e8A636d9153fF295bba3
- PLUGG on Robinhood: 0x09d56eaCb69E85Dca856B6dc15fA6aE9eeaBFBa3

## Links
- GitHub: https://github.com/michaelhutchings626-hub/alien-plugg-x402
- Chat: https://app.base44.com/superagent/6a5fdd57651262e86b24133e
- Discovery: https://x402.bankr.bot/0xabf922abb2a9e782f0b187d5d1ab24deb4870c3d/discovery
