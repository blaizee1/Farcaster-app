import { describe, it, expect } from "vitest"

describe("Heatmap API Contract", () => {
  it("should return valid heatmap response structure", () => {
    const mockResponse = {
      address: "0x1234567890",
      period: "30d",
      buckets: [
        {
          date: "2025-01-01",
          hour: 14,
          chain: "ethereum",
          contract: "0xabcd",
          count: 15,
          volume: "5.5",
          gasUsed: "0.05",
          intensity: 62,
        },
      ],
      chains: ["ethereum", "base"],
      topContracts: [{ contract: "0xabcd", count: 15 }],
      peakHour: 14,
      peakDay: "2025-01-01",
    }

    expect(mockResponse).toHaveProperty("address")
    expect(mockResponse).toHaveProperty("buckets")
    expect(mockResponse.buckets[0]).toHaveProperty("intensity")
    expect(mockResponse.buckets[0].intensity).toBeGreaterThanOrEqual(0)
    expect(mockResponse.buckets[0].intensity).toBeLessThanOrEqual(100)
  })

  it("should calculate intensity score correctly", () => {
    // Given values from example
    const count = 15
    const maxCount = 20
    const volume = 5.5
    const maxVolume = 10
    const gasUsed = 0.05
    const maxGas = 0.1

    // Calculate normalized values
    const normalizedCount = (count / maxCount) * 100 // 75
    const normalizedVolume = (volume / maxVolume) * 100 // 55
    const normalizedGas = (gasUsed / maxGas) * 100 // 50

    // Calculate intensity
    const intensity = Math.round(normalizedCount * 0.4 + normalizedVolume * 0.4 + normalizedGas * 0.2)

    expect(intensity).toBe(62)
  })
})
