"use client"

import { useEffect, useState } from "react"
import type { HeatmapResponse } from "@/app/api/heatmap/[address]/route"

interface HeatmapCalendarProps {
  address: string
}

export function HeatmapCalendar({ address }: HeatmapCalendarProps) {
  const [heatmapData, setHeatmapData] = useState<HeatmapResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHeatmap() {
      try {
        console.log("[v0] Fetching heatmap for address:", address)
        const response = await fetch(`/api/heatmap/${address}`)
        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Heatmap data received:", data)
          setHeatmapData(data)
        }
      } catch (error) {
        console.error("Failed to fetch heatmap:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHeatmap()
  }, [address])

  const getIntensityColor = (intensity: number, maxIntensity: number): string => {
    if (intensity === 0) return "rgb(30, 41, 59)" // slate-800 for no activity

    const normalizedIntensity = Math.min((intensity / maxIntensity) * 100, 100)

    // Create a gradient from purple to blue based on intensity
    if (normalizedIntensity < 25) {
      return "rgb(88, 28, 135)" // purple-900
    } else if (normalizedIntensity < 50) {
      return "rgb(126, 34, 206)" // purple-700
    } else if (normalizedIntensity < 75) {
      return "rgb(147, 51, 234)" // purple-600
    } else {
      return "rgb(59, 130, 246)" // blue-500
    }
  }

  if (loading) {
    return <div className="h-64 animate-pulse bg-muted rounded" />
  }

  if (!heatmapData) return null

  // Group buckets by date
  const dateMap = new Map<string, number>()
  heatmapData.buckets.forEach((bucket) => {
    const current = dateMap.get(bucket.date) || 0
    dateMap.set(bucket.date, current + bucket.intensity)
  })

  // Generate last 30 days
  const days: Array<{ date: string; intensity: number }> = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    days.push({
      date: dateStr,
      intensity: dateMap.get(dateStr) || 0,
    })
  }

  const maxIntensity = Math.max(...days.map((d) => d.intensity), 1)

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="h-3 w-3 rounded-sm border border-border bg-slate-800" />
          <div className="h-3 w-3 rounded-sm border border-border bg-purple-900" />
          <div className="h-3 w-3 rounded-sm border border-border bg-purple-700" />
          <div className="h-3 w-3 rounded-sm border border-border bg-purple-600" />
          <div className="h-3 w-3 rounded-sm border border-border bg-blue-500" />
        </div>
        <span>More</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const date = new Date(day.date)
          const color = getIntensityColor(day.intensity, maxIntensity)

          return (
            <div
              key={day.date}
              className="group relative aspect-square rounded-sm transition-all hover:scale-110 border border-border cursor-pointer"
              style={{
                backgroundColor: color,
              }}
            >
              <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded bg-popover px-2 py-1 text-xs text-popover-foreground shadow-lg group-hover:block whitespace-nowrap">
                <div className="font-medium">
                  {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
                <div className="text-muted-foreground">{day.intensity.toFixed(0)} activity</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Peak Day</p>
          <p className="text-lg font-semibold text-foreground">
            {heatmapData.peakDay
              ? new Date(heatmapData.peakDay).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : "N/A"}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Total Chains</p>
          <p className="text-lg font-semibold text-foreground">{heatmapData.chains.length}</p>
        </div>
      </div>
    </div>
  )
}
