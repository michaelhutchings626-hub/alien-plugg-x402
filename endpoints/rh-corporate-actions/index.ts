/**
 * rh-corporate-actions — Corporate actions for Robinhood Chain stock tokens
 * 
 * Track splits, dividends, mergers, and spin-offs affecting tokenized stock holders.
 * Critical for understanding multiplier changes and dividend eligibility.
 * 
 * GET                   — all corporate actions
 * GET ?symbol=AAPL      — actions for specific stock
 * GET ?type=dividend    — filter by action type (split, dividend, merger, etc.)
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
    const type = (url.searchParams.get("type") || "").toUpperCase();

    const res = await fetch("https://api.robinhood.com/rhj/corporate-actions");
    const data = await res.json();
    let actions = data.corpActions || [];

    if (symbol) actions = actions.filter((a: any) => a.tokenSymbol === symbol);
    if (type) actions = actions.filter((a: any) => a.type?.includes(type));

    const formatted = actions.map((a: any) => {
      const details = a.details || {};
      const detailKey = Object.keys(details)[0] || "";
      const detailValues = details[detailKey] || {};
      return {
        symbol: a.tokenSymbol,
        type: a.type?.replace("CORPORATE_ACTION_TYPE_", ""),
        status: a.status?.replace("CORPORATE_ACTION_STATUS_", ""),
        processDate: a.processDate ? `${a.processDate.year}-${String(a.processDate.month).padStart(2, "0")}-${String(a.processDate.day).padStart(2, "0")}` : null,
        contractAddress: a.deployments?.[0]?.contractAddress,
        details: detailValues,
      };
    });

    return Response.json({
      total: formatted.length,
      actions: formatted,
    }, { headers });
  } catch (error: any) {
    return Response.json({ error: "Failed to fetch corporate actions", message: error.message }, { status: 502, headers });
  }
}
