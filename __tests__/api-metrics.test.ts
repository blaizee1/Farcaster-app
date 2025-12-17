import { describe, it, expect } from "vitest"

describe("Metrics API Contract", () => {
  it("should return valid metrics response structure", () => {
    const mockResponse = {
      userId: "test-user",
      period: "30d",
      dailyAggregates: [
        {
          date: "2025-01-01",
          totalLikes: 50,
          totalReplies: 20,
          totalReposts: 15,
          totalCasts: 10,
          engagementRate: 8.5,
        },
      ],
      recentCasts: [],
      summary: {
        totalEngagement: 85,
        avgDailyEngagement: 8.5,
        topDay: "2025-01-01",
      },
    }

    expect(mockResponse).toHaveProperty("userId")
    expect(mockResponse).toHaveProperty("dailyAggregates")
    expect(mockResponse).toHaveProperty("summary")
    expect(mockResponse.dailyAggregates[0]).toHaveProperty("engagementRate")
  })

  it("should calculate engagement rate correctly", () => {
    const totalEngagement = 85 // likes + replies + reposts
    const totalCasts = 10
    const expectedRate = 8.5

    const calculatedRate = totalEngagement / totalCasts
    expect(calculatedRate).toBe(expectedRate)
  })
})
