/**
 * rh-dex-scanner — Robinhood Chain block and DEX activity scanner
 * 
 * Scans recent blocks on Robinhood Chain (chain ID 4663) for activity metrics,
 * gas prices, and transaction counts. Covers Uniswap v4 DEX infrastructure.
 * 
 * GET              — recent block activity + chain stats
 * GET ?blocks=10   — scan last N blocks (max 50)
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
    const blockCount = Math.min(parseInt(url.searchParams.get("blocks") || "5"), 50);
    const RPC = "https://rpc.mainnet.chain.robinhood.com";

    // Get latest block
    const blockRes = await fetch(RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 }),
    });
    const blockData = await blockRes.json();
    const latestBlock = parseInt(blockData.result, 16);

    // Fetch recent blocks in parallel
    const blockPromises = [];
    for (let i = 0; i < blockCount; i++) {
      const blockHex = "0x" + (latestBlock - i).toString(16);
      blockPromises.push(
        fetch(RPC, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", method: "eth_getBlockByNumber", params: [blockHex, false], id: i + 2 }),
        }).then(r => r.json())
      );
    }
    const blocks = await Promise.all(blockPromises);

    const blockInfos = blocks.map((b: any) => {
      const blk = b.result;
      const gasUsed = parseInt(blk.gasUsed, 16);
      const gasLimit = parseInt(blk.gasLimit, 16);
      return {
        number: parseInt(blk.number, 16),
        hash: blk.hash,
        timestamp: new Date(parseInt(blk.timestamp, 16) * 1000).toISOString(),
        txCount: blk.transactions.length,
        gasUsed,
        gasLimit,
        gasUtilization: ((gasUsed / gasLimit) * 100).toFixed(1) + "%",
        baseFee: blk.baseFeePerGas ? (parseInt(blk.baseFeePerGas, 16) / 1e9).toFixed(6) + " gwei" : "N/A",
      };
    });

    // Aggregate stats
    const totalTxs = blockInfos.reduce((sum, b) => sum + b.txCount, 0);
    const avgGasUtil = (blockInfos.reduce((sum, b) => sum + parseFloat(b.gasUtilization), 0) / blockInfos.length).toFixed(1) + "%";

    return Response.json({
      chain: "Robinhood Chain",
      chainId: 4663,
      latestBlock,
      scanTime: new Date().toISOString(),
      dex: "Uniswap v4",
      stats: {
        blocksScanned: blockCount,
        totalTransactions: totalTxs,
        avgGasUtilization: avgGasUtil,
        avgTxsPerBlock: Math.round(totalTxs / blockCount),
      },
      recentBlocks: blockInfos,
      explorer: "https://robinhoodchain.blockscout.com",
      rpc: "https://rpc.mainnet.chain.robinhood.com",
    }, { headers });
  } catch (error: any) {
    return Response.json({ error: "Failed to scan Robinhood Chain", message: error.message }, { status: 502, headers });
  }
}
