"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HeatmapCalendar } from "@/components/heatmap-calendar"
import { HourlyDensityChart } from "@/components/hourly-density-chart"
import { InteractiveTimeline } from "@/components/interactive-timeline"
import { MetricsSummary } from "@/components/metrics-summary"
import { Activity, Zap } from "lucide-react"

export function DashboardView() {
  const [userId, setUserId] = useState("")
  const [address, setAddress] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)

  const handleLoadData = () => {
    if (userId && address) {
      setIsLoaded(true)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Activity className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">OnChain Pulse</h1>
                <p className="text-xs text-muted-foreground">Social & On-Chain Analytics</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Connect Wallet
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!isLoaded ? (
          <Card className="mx-auto max-w-2xl p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Get Started</h2>
                <p className="text-muted-foreground">
                  Enter your Farcaster ID and wallet address to visualize your activity
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Farcaster ID or Username</label>
                  <Input placeholder="e.g., dwr.eth or 3" value={userId} onChange={(e) => setUserId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Wallet Address</label>
                  <Input placeholder="0x..." value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <Button className="w-full" size="lg" onClick={handleLoadData} disabled={!userId || !address}>
                  Load Dashboard
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Metrics Summary */}
            <MetricsSummary userId={userId} address={address} />

            {/* Main Content Tabs */}
            <Tabs defaultValue="heatmap" className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
                <TabsTrigger value="density">Hourly</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="heatmap" className="space-y-4">
                <Card className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Activity Heatmap</h3>
                      <p className="text-sm text-muted-foreground">
                        Your on-chain transaction intensity over the past 30 days
                      </p>
                    </div>
                    <HeatmapCalendar address={address} />
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="density" className="space-y-4">
                <Card className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Hourly Density</h3>
                      <p className="text-sm text-muted-foreground">
                        Transaction and social activity distribution by hour of day
                      </p>
                    </div>
                    <HourlyDensityChart userId={userId} address={address} />
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <Card className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Interactive Timeline</h3>
                      <p className="text-sm text-muted-foreground">Social events linked to on-chain transactions</p>
                    </div>
                    <InteractiveTimeline userId={userId} address={address} />
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
