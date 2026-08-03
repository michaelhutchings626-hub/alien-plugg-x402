/**
 * rh-stock-list — Full catalog of Robinhood Chain stock tokens
 * 
 * Lists all 90+ tokenized stocks with contract addresses, multipliers, trading status,
 * and capabilities (fractional, all-day, extended hours).
 * 
 * GET                    — all active stock tokens
 * GET ?status=all        — include inactive
 * GET ?tradable=true     — only fractional-tradable tokens
 * GET ?filter=tech        — filter by symbol/name
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
    const filter = (url.searchParams.get("filter") || "").toLowerCase();
    const status = url.searchParams.get("status") || "active";
    const tradableOnly = url.searchParams.get("tradable") === "true";

    const res = await fetch("https://api.robinhood.com/rhj/assets");
    const data = await res.json();
    let assets = data.assets || [];

    if (status !== "all") {
      assets = assets.filter((a: any) => a.status === "ASSET_STATUS_ACTIVE");
    }
    if (tradableOnly) {
      assets = assets.filter((a: any) => a.tradingCapabilities?.fractionalTradability === "tradable");
    }
    if (filter) {
      assets = assets.filter((a: any) =>
        a.tokenSymbol?.toLowerCase().includes(filter) ||
        a.tokenName?.toLowerCase().includes(filter)
      );
    }

    const tokens = assets.map((a: any) => ({
      symbol: a.tokenSymbol,
      name: a.tokenName,
      status: a.status?.replace("ASSET_STATUS_", ""),
      contractAddress: a.deployments?.[0]?.contractAddress,
      chainId: a.deployments?.[0]?.chainId || 4663,
      multiplier: a.currentMultiplier,
      pendingMultiplier: a.pendingMultiplier || null,
      logo: a.logoUrl,
      fractionalTradability: a.tradingCapabilities?.fractionalTradability || null,
      allDayTradability: a.tradingCapabilities?.allDayTradability || null,
      extendedHours: a.tradingCapabilities?.extendedHoursFractionalTradability || null,
    }));

    return Response.json({
      total: tokens.length,
      chain: "Robinhood Chain",
      chainId: 4663,
      tokens,
    }, { headers });
  } catch (error: any) {
    return Response.json({ error: "Failed to fetch stock token list", message: error.message }, { status: 502, headers });
  }
}
