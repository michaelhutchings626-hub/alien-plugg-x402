/**
 * rh-stock-screener — Screen and rank Robinhood Chain stock tokens
 * 
 * Filter by volume, tradability, extended hours. Sort by volume, spread, or price.
 * Perfect for finding the most liquid tokenized stocks.
 * 
 * GET ?sort=volume&limit=20           — top 20 by volume
 * GET ?minVolume=1000000              — only stocks above $1M volume
 * GET ?extendedHours=true             — only extended-hours tradable
 * GET ?allDay=true                    — only 24/5 tradable
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
    const minVolume = parseFloat(url.searchParams.get("minVolume") || "0");
    const sortBy = url.searchParams.get("sort") || "volume";
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const extendedHoursOnly = url.searchParams.get("extendedHours") === "true";
    const allDayOnly = url.searchParams.get("allDay") === "true";

    // Fetch all assets
    const assetsRes = await fetch("https://api.robinhood.com/rhj/assets");
    const assetsData = await assetsRes.json();
    let assets = (assetsData.assets || []).filter((a: any) => a.status === "ASSET_STATUS_ACTIVE");

    if (extendedHoursOnly) {
      assets = assets.filter((a: any) => a.tradingCapabilities?.extendedHoursFractionalTradability === true);
    }
    if (allDayOnly) {
      assets = assets.filter((a: any) => a.tradingCapabilities?.allDayTradability === "tradable");
    }

    // Fetch prices in parallel
    const results: any[] = [];
    for (let i = 0; i < assets.length; i += 20) {
      const chunk = assets.slice(i, i + 20);
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
        const volume = parseFloat(cr.quote.dailyTradingVolume || "0");
        if (volume < minVolume) continue;
        const bid = parseFloat(cr.quote.bid || "0");
        const ask = parseFloat(cr.quote.ask || "0");
        results.push({
          symbol: cr.quote.tokenSymbol,
          name: cr.asset.tokenName,
          bid, ask,
          spread: (ask - bid).toFixed(2),
          volume,
          tradingHalt: cr.quote.isTradingHalt,
          contractAddress: cr.asset.deployments?.[0]?.contractAddress,
          fractional: cr.asset.tradingCapabilities?.fractionalTradability,
          allDay: cr.asset.tradingCapabilities?.allDayTradability,
          extendedHours: cr.asset.tradingCapabilities?.extendedHoursFractionalTradability,
        });
      }
    }

    if (sortBy === "volume") results.sort((a, b) => b.volume - a.volume);
    else if (sortBy === "spread") results.sort((a, b) => parseFloat(a.spread) - parseFloat(b.spread));
    else if (sortBy === "price") results.sort((a, b) => b.bid - a.bid);

    return Response.json({
      total: results.length,
      sortedBy: sortBy,
      chain: "Robinhood Chain",
      tokens: results.slice(0, limit),
    }, { headers });
  } catch (error: any) {
    return Response.json({ error: "Failed to screen stock tokens", message: error.message }, { status: 502, headers });
  }
}
