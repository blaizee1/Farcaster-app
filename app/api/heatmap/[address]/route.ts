import { type NextRequest, NextResponse } from "next/server"

// Type definitions for on-chain heatmap
export interface ActivityBucket {
  date: string
  hour: number
  chain: string
  contract: string
  count: number
  volume: string
  gasUsed: string
  intensity: number
}

export interface HeatmapResponse {
  address: string
  period: string
  buckets: ActivityBucket[]
  chains: string[]
  topContracts: Array<{ contract: string; count: number }>
  peakHour: number
  peakDay: string
}

// Chain IDs for multi-chain support
const SUPPORTED_CHAINS = {
  ethereum: 1,
  base: 8453,
  optimism: 10,
  polygon: 137,
  arbitrum: 42161,
}

// Fetch from The Graph
async function fetchFromTheGraph(address: string, chain: string) {
  const subgraphUrls: Record<string, string> = {
    ethereum: process.env.GRAPH_ETHEREUM_URL || "",
    base: process.env.GRAPH_BASE_URL || "",
    optimism: process.env.GRAPH_OPTIMISM_URL || "",
  }

  const url = subgraphUrls[chain]
  if (!url) return []

  const query = `
    query GetTransactions($address: String!) {
      transactions(
        where: { from: $address }
        orderBy: timestamp
        orderDirection: desc
        first: 1000
      ) {
        id
        timestamp
        to
        value
        gasUsed
      }
    }
  `

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { address } }),
    })

    if (!response.ok) throw new Error("Graph query failed")

    const data = await response.json()
    return data.data?.transactions || []
  } catch (error) {
    console.error(`Error fetching from The Graph (${chain}):`, error)
    return []
  }
}

// Fetch from Alchemy/Covalent as fallback
async function fetchFromAlchemy(address: string, chainId: number) {
  const alchemyKey = process.env.ALCHEMY_API_KEY
  if (!alchemyKey) return []

  const chainMap: Record<number, string> = {
    1: "eth-mainnet",
    8453: "base-mainnet",
    10: "opt-mainnet",
    137: "polygon-mainnet",
    42161: "arb-mainnet",
  }

  const network = chainMap[chainId]
  if (!network) return []

  try {
    const response = await fetch(`https://${network}.g.alchemy.com/v2/${alchemyKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "alchemy_getAssetTransfers",
        params: [
          {
            fromBlock: "0x0",
            fromAddress: address,
            category: ["external", "internal", "erc20", "erc721", "erc1155"],
            maxCount: "0x3e8", // 1000 in hex
          },
        ],
      }),
    })

    if (!response.ok) throw new Error("Alchemy query failed")

    const data = await response.json()
    return data.result?.transfers || []
  } catch (error) {
    console.error(`Error fetching from Alchemy (chain ${chainId}):`, error)
    return []
  }
}

// Generate mock on-chain data for development
function generateMockOnChainData(address: string): ActivityBucket[] {
  const buckets: ActivityBucket[] = []
  const chains = ["ethereum", "base", "optimism"]
  const contracts = ["0x1234...5678", "0xabcd...ef00", "0x9876...5432", "0xdead...beef"]

  // Generate 30 days of data
  for (let day = 0; day < 30; day++) {
    const date = new Date()
    date.setDate(date.getDate() - day)
    const dateStr = date.toISOString().split("T")[0]

    // Generate some hourly buckets for each day
    const numBuckets = Math.floor(Math.random() * 8) + 2
    for (let i = 0; i < numBuckets; i++) {
      const hour = Math.floor(Math.random() * 24)
      const chain = chains[Math.floor(Math.random() * chains.length)]
      const contract = contracts[Math.floor(Math.random() * contracts.length)]
      const count = Math.floor(Math.random() * 20) + 1
      const volume = (Math.random() * 10).toFixed(4)
      const gasUsed = (Math.random() * 0.1).toFixed(6)

      buckets.push({
        date: dateStr,
        hour,
        chain,
        contract,
        count,
        volume,
        gasUsed,
        intensity: 0, // Will calculate below
      })
    }
  }

  return buckets
}

/**
 * Calculate heatmap intensity score
 *
 * Formula: intensity = (normalizedCount * 0.4) + (normalizedVolume * 0.4) + (normalizedGas * 0.2)
 *
 * Where:
 * - normalizedCount = (count / maxCount) * 100
 * - normalizedVolume = (volume / maxVolume) * 100
 * - normalizedGas = (gas / maxGas) * 100
 *
 * Example calculation:
 * Given: count=15, volume=5.5 ETH, gas=0.05 ETH
 * If max values are: maxCount=20, maxVolume=10, maxGas=0.1
 * Then:
 * - normalizedCount = (15/20) * 100 = 75
 * - normalizedVolume = (5.5/10) * 100 = 55
 * - normalizedGas = (0.05/0.1) * 100 = 50
 * - intensity = (75 * 0.4) + (55 * 0.4) + (50 * 0.2) = 30 + 22 + 10 = 62
 */
function calculateIntensity(buckets: ActivityBucket[]): ActivityBucket[] {
  const maxCount = Math.max(...buckets.map((b) => b.count), 1)
  const maxVolume = Math.max(...buckets.map((b) => Number.parseFloat(b.volume)), 1)
  const maxGas = Math.max(...buckets.map((b) => Number.parseFloat(b.gasUsed)), 1)

  return buckets.map((bucket) => ({
    ...bucket,
    intensity: Math.round(
      (bucket.count / maxCount) * 40 +
        (Number.parseFloat(bucket.volume) / maxVolume) * 40 +
        (Number.parseFloat(bucket.gasUsed) / maxGas) * 20,
    ),
  }))
}

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  const { address } = params
  const searchParams = request.nextUrl.searchParams
  const period = searchParams.get("period") || "30d"
  const useRealData = searchParams.get("real") === "true"

  try {
    let buckets: ActivityBucket[]

    if (useRealData && (process.env.ALCHEMY_API_KEY || process.env.GRAPH_ETHEREUM_URL)) {
      // Fetch real data from multiple chains in parallel
      const chainPromises = Object.entries(SUPPORTED_CHAINS).map(async ([chain, chainId]) => {
        const graphData = await fetchFromTheGraph(address, chain)
        if (graphData.length > 0) return { chain, data: graphData }

        const alchemyData = await fetchFromAlchemy(address, chainId)
        return { chain, data: alchemyData }
      })

      const results = await Promise.all(chainPromises)

      // Transform results into buckets
      buckets = results.flatMap(({ chain, data }) => {
        return data.map((tx: any) => {
          const date = new Date(tx.timestamp || tx.metadata?.blockTimestamp)
          return {
            date: date.toISOString().split("T")[0],
            hour: date.getHours(),
            chain,
            contract: tx.to || tx.contract,
            count: 1,
            volume: tx.value || "0",
            gasUsed: tx.gasUsed || "0",
            intensity: 0,
          }
        })
      })
    } else {
      // Use mock data for development
      buckets = generateMockOnChainData(address)
    }

    // Calculate intensity scores
    buckets = calculateIntensity(buckets)

    // Aggregate statistics
    const chains = [...new Set(buckets.map((b) => b.chain))]
    const contractCounts = new Map<string, number>()
    buckets.forEach((b) => {
      contractCounts.set(b.contract, (contractCounts.get(b.contract) || 0) + b.count)
    })

    const topContracts = Array.from(contractCounts.entries())
      .map(([contract, count]) => ({ contract, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Find peak activity
    const hourCounts = new Map<number, number>()
    const dayCounts = new Map<string, number>()

    buckets.forEach((b) => {
      hourCounts.set(b.hour, (hourCounts.get(b.hour) || 0) + b.count)
      dayCounts.set(b.date, (dayCounts.get(b.date) || 0) + b.count)
    })

    const peakHour = Array.from(hourCounts.entries()).reduce(
      (max, [hour, count]) => (count > (hourCounts.get(max) || 0) ? hour : max),
      0,
    )

    const peakDay = Array.from(dayCounts.entries()).reduce(
      (max, [day, count]) => (count > (dayCounts.get(max[0]) || 0) ? [day, count] : max),
      ["", 0],
    )[0]

    const response: HeatmapResponse = {
      address,
      period,
      buckets,
      chains,
      topContracts,
      peakHour,
      peakDay,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in heatmap API:", error)
    return NextResponse.json({ error: "Failed to fetch heatmap data" }, { status: 500 })
  }
}
