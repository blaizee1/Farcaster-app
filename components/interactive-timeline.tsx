"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight } from "lucide-react"
import type { MetricsResponse, CastMetric } from "@/app/api/metrics/[userId]/route"
import type { HeatmapResponse, ActivityBucket } from "@/app/api/heatmap/[address]/route"

interface TimelineEvent {
  timestamp: Date
  type: "social" | "onchain"
  social?: CastMetric
  onchain?: ActivityBucket
  linkedEvent?: {
    type: "social" | "onchain"
    data: CastMetric | ActivityBucket
    timeDiff: number
  }
}

interface InteractiveTimelineProps {
  userId: string
  address: string
}

export function InteractiveTimeline({ userId, address }: InteractiveTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [metricsRes, heatmapRes] = await Promise.all([
          fetch(`/api/metrics/${userId}`),
          fetch(`/api/heatmap/${address}`),
        ])

        if (metricsRes.ok && heatmapRes.ok) {
          const metrics: MetricsResponse = await metricsRes.json()
          const heatmap: HeatmapResponse = await heatmapRes.json()

          // Combine and sort events by timestamp
          const socialEvents: TimelineEvent[] = metrics.recentCasts.map((cast) => ({
            timestamp: new Date(cast.timestamp),
            type: "social" as const,
            social: cast,
          }))

          const onchainEvents: TimelineEvent[] = heatmap.buckets.map((bucket) => ({
            timestamp: new Date(`${bucket.date}T${bucket.hour.toString().padStart(2, "0")}:00:00`),
            type: "onchain" as const,
            onchain: bucket,
          }))

          const allEvents = [...socialEvents, ...onchainEvents]
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 50) // Show most recent 50 events

          // Link events that are close in time (within 1 hour)
          const linkedEvents = allEvents.map((event) => {
            const nearbyEvent = allEvents.find((other) => {
              if (other.type === event.type) return false
              const timeDiff = Math.abs(event.timestamp.getTime() - other.timestamp.getTime())
              return timeDiff < 3600000 // 1 hour in milliseconds
            })

            if (nearbyEvent) {
              return {
                ...event,
                linkedEvent: {
                  type: nearbyEvent.type,
                  data: nearbyEvent.type === "social" ? nearbyEvent.social! : nearbyEvent.onchain!,
                  timeDiff: Math.abs(event.timestamp.getTime() - nearbyEvent.timestamp.getTime()) / 60000, // in minutes
                },
              }
            }

            return event
          })

          setEvents(linkedEvents)
        }
      } catch (error) {
        console.error("Failed to fetch timeline data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, address])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse bg-muted rounded" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto">
      {events.map((event, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-start gap-4">
            {/* Timeline indicator */}
            <div className="flex flex-col items-center">
              <div className={`h-3 w-3 rounded-full ${event.type === "social" ? "bg-blue-500" : "bg-purple-500"}`} />
              {index < events.length - 1 && <div className="w-px h-16 bg-border mt-2" />}
            </div>

            {/* Event content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant={event.type === "social" ? "default" : "secondary"}>
                  {event.type === "social" ? "Social" : "On-Chain"}
                </Badge>
                <span className="text-xs text-muted-foreground">{event.timestamp.toLocaleString()}</span>
              </div>

              {event.type === "social" && event.social && (
                <div className="space-y-1">
                  <p className="text-sm text-foreground">{event.social.text}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{event.social.likes} likes</span>
                    <span>{event.social.replies} replies</span>
                    <span>{event.social.reposts} reposts</span>
                  </div>
                </div>
              )}

              {event.type === "onchain" && event.onchain && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {event.onchain.chain}
                    </Badge>
                    <span className="text-sm font-mono text-muted-foreground">
                      {event.onchain.contract.slice(0, 10)}...
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{event.onchain.count} txs</span>
                    <span>{event.onchain.volume} ETH</span>
                    <span>Intensity: {event.onchain.intensity}</span>
                  </div>
                </div>
              )}

              {/* Linked event indicator */}
              {event.linkedEvent && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded p-2">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>
                    Linked {event.linkedEvent.type === "social" ? "social" : "on-chain"} event{" "}
                    {Math.round(event.linkedEvent.timeDiff)} minutes away
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
