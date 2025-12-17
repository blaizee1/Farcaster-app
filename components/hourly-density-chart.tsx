"use client"

import { useEffect, useState } from "react"
import type { MetricsResponse } from "@/app/api/metrics/[userId]/route"
import type { HeatmapResponse } from "@/app/api/heatmap/[address]/route"

interface HourlyDensityChartProps {
  userId: string
  address: string
}

export function HourlyDensityChart({ userId, address }: HourlyDensityChartProps) {
  const [data, setData] = useState<{ hour: number; social: number; onchain: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("[v0] Fetching hourly data for userId:", userId, "address:", address)
        const [metricsRes, heatmapRes] = await Promise.all([
          fetch(`/api/metrics/${userId}`),
          fetch(`/api/heatmap/${address}`),
        ])

        if (metricsRes.ok && heatmapRes.ok) {
          const metrics: MetricsResponse = await metricsRes.json()
          const heatmap: HeatmapResponse = await heatmapRes.json()

          console.log("[v0] Metrics received:", metrics)
          console.log("[v0] Heatmap received:", heatmap)

          // Aggregate by hour
          const hourlyData = Array.from({ length: 24 }, (_, hour) => {
            // Count social activity
            const socialCount = metrics.recentCasts.filter((cast) => {
              const castHour = new Date(cast.timestamp).getHours()
              return castHour === hour
            }).length

            // Count on-chain activity
            const onchainCount = heatmap.buckets
              .filter((bucket) => bucket.hour === hour)
              .reduce((sum, bucket) => sum + bucket.count, 0)

            return { hour, social: socialCount, onchain: onchainCount }
          })

          console.log("[v0] Hourly data aggregated:", hourlyData)
          setData(hourlyData)
        }
      } catch (error) {
        console.error("Failed to fetch hourly data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, address])

  if (loading) {
    return <div className="h-64 animate-pulse bg-muted rounded" />
  }

  const maxValue = Math.max(...data.map((d) => d.social + d.onchain), 1)

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="relative h-64 border border-border rounded-lg p-4 bg-card">
        <div className="absolute inset-4 flex flex-col justify-between pointer-events-none">
          {[100, 75, 50, 25, 0].map((percent) => (
            <div key={percent} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-8 text-right">
                {Math.round((maxValue * percent) / 100)}
              </span>
              <div className="flex-1 h-px bg-border/50" />
            </div>
          ))}
        </div>

        <div className="absolute inset-4 flex items-end justify-between gap-0.5 pl-12">
          {data.map((item) => {
            const total = item.social + item.onchain
            const totalHeight = total > 0 ? (total / maxValue) * 100 : 0
            const socialHeight = item.social > 0 ? (item.social / total) * 100 : 0
            const onchainHeight = item.onchain > 0 ? (item.onchain / total) * 100 : 0

            return (
              <div key={item.hour} className="group relative flex-1 flex flex-col items-center justify-end h-full">
                {total > 0 && (
                  <div
                    className="w-full flex flex-col rounded-t overflow-hidden transition-all"
                    style={{ height: `${totalHeight}%`, minHeight: "8px" }}
                  >
                    {/* Social activity on top */}
                    {item.social > 0 && (
                      <div
                        className="w-full bg-blue-500 hover:bg-blue-600 transition-colors"
                        style={{ height: `${socialHeight}%`, minHeight: item.social > 0 ? "2px" : "0" }}
                      />
                    )}
                    {/* On-chain activity on bottom */}
                    {item.onchain > 0 && (
                      <div
                        className="w-full bg-purple-500 hover:bg-purple-600 transition-colors"
                        style={{ height: `${onchainHeight}%`, minHeight: item.onchain > 0 ? "2px" : "0" }}
                      />
                    )}
                  </div>
                )}

                <div className="absolute bottom-full mb-2 hidden group-hover:block z-20 rounded-lg bg-popover px-3 py-2 text-xs text-popover-foreground shadow-xl whitespace-nowrap border border-border">
                  <div className="font-semibold text-sm mb-1">{item.hour}:00</div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span>Social: {item.social}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-purple-500" />
                      <span>On-chain: {item.onchain}</span>
                    </div>
                    <div className="pt-0.5 border-t border-border/50 mt-1">
                      <span className="font-medium">Total: {total}</span>
                    </div>
                  </div>
                </div>

                {/* Hour label below */}
                {item.hour % 3 === 0 && (
                  <div className="absolute -bottom-5 text-[10px] text-muted-foreground">{item.hour}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Hour labels */}
      <div className="flex justify-between text-xs text-muted-foreground px-4">
        {[0, 6, 12, 18, 23].map((hour) => (
          <span key={hour}>{hour}:00</span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-blue-500" />
          <span className="text-muted-foreground">Social Activity</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-purple-500" />
          <span className="text-muted-foreground">On-Chain Activity</span>
        </div>
      </div>
    </div>
  )
}
