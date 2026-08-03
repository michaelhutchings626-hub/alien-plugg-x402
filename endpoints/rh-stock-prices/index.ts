/**
 * rh-stock-prices — Live stock token prices on Robinhood Chain
 * 
 * Get real-time bid/ask for any of 90+ tokenized stocks (NVDA, AAPL, GOOGL, TSLA, etc.)
 * Returns raw prices, multiplier-adjusted token prices, volume, and trading halt status.
 * 
 * GET ?symbol=NVDA  — get price for specific stock
 * GET (no params)   — get prices for all active stock tokens
 */
export default async function handler(req: Request): Promise<Response> {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });

  try {
    const url = new URL(req.url);
    const symbol = (url.searchParams.get("symbol") || "").toUpperCase();

    // Fetch assets for multiplier data
    const assetsRes = await fetch("https://api.robinhood.com/rhj/assets");
    const assetsData = await assetsRes.json();

    if (symbol) {
      // Single symbol
      const asset = assetsData.assets.find((a: any) => a.tokenSymbol === symbol);
      if (!asset) return Response.json({ error: `Stock token ${symbol} not found`, available: assetsData.assets.map((a: any) => a.tokenSymbol).slice(0, 20) }, { headers });

      const pricesRes = await fetch(`https://api.robinhood.com/rhj/prices/${symbol}`);
      const pricesData = await pricesRes.json();
      const quote = pricesData.quotes?.[0];
      if (!quote) return Response.json({ error: `No price data for ${symbol}` }, { status: 404, headers });

      const mult = parseFloat(asset.currentMultiplier || "1");
      const bid = parseFloat(quote.bid || "0");
      const ask = parseFloat(quote.ask || "0");

      return Response.json({
        symbol: quote.tokenSymbol,
        name: asset.tokenName,
        bid: quote.bid,
        ask: quote.ask,
        mid: ((bid + ask) / 2).toFixed(2),
        spread: (ask - bid).toFixed(2),
        currency: quote.currency,
        dailyVolume: quote.dailyTradingVolume,
        tradingHalt: quote.isTradingHalt,
        multiplier: asset.currentMultiplier,
        tokenAdjustedBid: (bid * mult).toFixed(2),
        tokenAdjustedAsk: (ask * mult).toFixed(2),
        contractAddress: asset.deployments?.[0]?.contractAddress,
        chainId: 4663,
        chain: "Robinhood Chain",
        tradability: asset.tradingCapabilities,
        generatedAt: quote.generatedAt,
      }, { headers });
    } else {
      // All active stock tokens
      const activeAssets = assetsData.assets.filter((a: any) => a.status === "ASSET_STATUS_ACTIVE");
      const results: any[] = [];

      // Fetch prices in parallel (chunks of 20)
      for (let i = 0; i < activeAssets.length; i += 20) {
        const chunk = activeAssets.slice(i, i + 20);
        const promises = chunk.map(async (asset: any) => {
          try {
            const r = await fetch(`https://api.robinhood.com/rhj/prices/${asset.tokenSymbol}`);
            const d = await r.json();
            return { asset, quote: d.quotes?.[0] };
          } catch { return { asset, quote: null }; }
        });
        const chunkResults = await Promise.all(promises);
        for (const cr of chunkResults) {
          if (!cr.quote) continue;
          results.push({
            symbol: cr.quote.tokenSymbol,
            name: cr.asset.tokenName,
            bid: cr.quote.bid,
            ask: cr.quote.ask,
            volume: cr.quote.dailyTradingVolume,
            tradingHalt: cr.quote.isTradingHalt,
            contractAddress: cr.asset.deployments?.[0]?.contractAddress,
          });
        }
      }

      return Response.json({
        total: results.length,
        chain: "Robinhood Chain",
        chainId: 4663,
        tokens: results,
        generatedAt: new Date().toISOString(),
      }, { headers });
    }
  } catch (error: any) {
    return Response.json({ error: "Failed to fetch stock token prices", message: error.message }, { status: 502, headers });
  }
}
