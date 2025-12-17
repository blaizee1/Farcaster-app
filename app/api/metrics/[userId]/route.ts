import { type NextRequest, NextResponse } from "next/server"

// Type definitions for social metrics
export interface CastMetric {
  timestamp: string
  likes: number
  replies: number
  reposts: number
  castHash: string
  text: string
}

export interface DailyAggregate {
  date: string
  totalLikes: number
  totalReplies: number
  totalReposts: number
  totalCasts: number
  engagementRate: number
}

export interface MetricsResponse {
  userId: string
  period: string
  dailyAggregates: DailyAggregate[]
  recentCasts: CastMetric[]
  summary: {
    totalEngagement: number
    avgDailyEngagement: number
    topDay: string
  }
}

// Helper function to fetch from Farcaster Hub
async function fetchFarcasterData(fid: string) {
  // In production, use Neynar API or direct hub connection
  const hubUrl = process.env.FARCASTER_HUB_URL || "https://hub.farcaster.xyz"

  try {
    console.log("[v0] Attempting to fetch Farcaster data for FID:", fid)

    // Fetch user casts - this is a simplified example
    const response = await fetch(`${hubUrl}/v1/castsByFid?fid=${fid}&limit=100`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    console.log("[v0] Response status:", response.status)

    if (!response.ok) {
      console.log("[v0] Response not OK, using mock data")
      return generateMockFarcasterData()
    }

    // Get the response text first to safely check if it's valid JSON
    const text = await response.text()

    try {
      const data = JSON.parse(text)
      console.log("[v0] Successfully parsed JSON response")
      return data
    } catch (parseError) {
      console.log("[v0] Failed to parse JSON, using mock data. Response text:", text.substring(0, 100))
      return generateMockFarcasterData()
    }
  } catch (error) {
    console.log("[v0] Network error, using mock data:", error)
    // Return mock data for development
    return generateMockFarcasterData()
  }
}

// Generate mock data for development/testing
function generateMockFarcasterData() {
  const casts: CastMetric[] = []
  const daysBack = 30

  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * daysBack)
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)

    casts.push({
      timestamp: date.toISOString(),
      likes: Math.floor(Math.random() * 50),
      replies: Math.floor(Math.random() * 20),
      reposts: Math.floor(Math.random() * 15),
      castHash: `0x${Math.random().toString(16).slice(2, 10)}`,
      text: `Sample cast ${i + 1}`,
    })
  }

  return { messages: casts }
}

// Aggregate data by day
function aggregateByDay(casts: CastMetric[]): DailyAggregate[] {
  const dayMap = new Map<string, DailyAggregate>()

  casts.forEach((cast) => {
    const date = new Date(cast.timestamp).toISOString().split("T")[0]

    if (!dayMap.has(date)) {
      dayMap.set(date, {
        date,
        totalLikes: 0,
        totalReplies: 0,
        totalReposts: 0,
        totalCasts: 0,
        engagementRate: 0,
      })
    }

    const day = dayMap.get(date)!
    day.totalLikes += cast.likes
    day.totalReplies += cast.replies
    day.totalReposts += cast.reposts
    day.totalCasts += 1
  })

  // Calculate engagement rate
  dayMap.forEach((day) => {
    const totalEngagement = day.totalLikes + day.totalReplies + day.totalReposts
    day.engagementRate = day.totalCasts > 0 ? totalEngagement / day.totalCasts : 0
  })

  return Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date))
}

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params
  const searchParams = request.nextUrl.searchParams
  const period = searchParams.get("period") || "30d"

  try {
    // Fetch data from Farcaster
    const farcasterData = await fetchFarcasterData(userId)
    const casts: CastMetric[] = farcasterData.messages || []

    // Aggregate by day
    const dailyAggregates = aggregateByDay(casts)

    // Calculate summary stats
    const totalEngagement = dailyAggregates.reduce(
      (sum, day) => sum + day.totalLikes + day.totalReplies + day.totalReposts,
      0,
    )

    const avgDailyEngagement = dailyAggregates.length > 0 ? totalEngagement / dailyAggregates.length : 0

    const topDay = dailyAggregates.reduce(
      (max, day) => {
        const dayEngagement = day.totalLikes + day.totalReplies + day.totalReposts
        const maxEngagement = max.totalLikes + max.totalReplies + max.totalReposts
        return dayEngagement > maxEngagement ? day : max
      },
      dailyAggregates[0] || {
        date: "",
        totalLikes: 0,
        totalReplies: 0,
        totalReposts: 0,
        totalCasts: 0,
        engagementRate: 0,
      },
    )

    const response: MetricsResponse = {
      userId,
      period,
      dailyAggregates,
      recentCasts: casts.slice(0, 20),
      summary: {
        totalEngagement,
        avgDailyEngagement,
        topDay: topDay.date,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in metrics API:", error)
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 })
  }
}
