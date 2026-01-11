"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Activity, MessageSquare, Repeat2, ThumbsUp } from "lucide-react"
import type { MetricsResponse } from "@/app/api/metrics/[userId]/route"

interface MetricsSummaryProps {
  userId: string
  address?: string
}

export function MetricsSummary({ userId, address }: MetricsSummaryProps) {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch(`/api/metrics/${userId}`)
        if (response.ok) {
          const data = await response.json()
          setMetrics(data)
        }
      } catch (error) {
        console.error("Failed to fetch metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [userId])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="h-20 animate-pulse bg-muted rounded" />
          </Card>
        ))}
      </div>
    )
  }

  if (!metrics) return null

  const totalCasts = metrics.dailyAggregates.reduce((sum, day) => sum + day.totalCasts, 0)
  const totalLikes = metrics.dailyAggregates.reduce((sum, day) => sum + day.totalLikes, 0)
  const totalReplies = metrics.dailyAggregates.reduce((sum, day) => sum + day.totalReplies, 0)
  const totalReposts = metrics.dailyAggregates.reduce((sum, day) => sum + day.totalReposts, 0)

  const stats = [
    { label: "Total Casts", value: totalCasts, icon: Activity, color: "text-blue-500" },
    { label: "Total Likes", value: totalLikes, icon: ThumbsUp, color: "text-green-500" },
    { label: "Total Replies", value: totalReplies, icon: MessageSquare, color: "text-purple-500" },
    { label: "Total Reposts", value: totalReposts, icon: Repeat2, color: "text-orange-500" },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
              </div>
              <Icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </Card>
        )
      })}
    </div>
  )
}
