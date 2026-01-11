"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MetricsSummary } from "@/components/metrics-summary"
import { Activity } from "lucide-react"
import { sdk } from '@farcaster/miniapp-sdk'

export function DashboardView() {
  const [userId, setUserId] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get user context from Farcaster SDK
    const getContext = () => {
      try {
        // SDK context is reactive - subscribe to changes
        const context = sdk.context
        if (context?.user?.fid) {
          setUserId(context.user.fid.toString())
          setIsConnected(true)
        }
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to get Farcaster context:", error)
        setIsLoading(false)
      }
    }

    // Try to get context after SDK is ready
    const timer = setTimeout(() => {
      getContext()
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const handleConnect = () => {
    try {
      const context = sdk.context
      if (context?.user?.fid) {
        setUserId(context.user.fid.toString())
        setIsConnected(true)
      }
    } catch (error) {
      console.error("Failed to connect:", error)
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
                <h1 className="text-xl font-bold text-foreground">Activity Pulse</h1>
                <p className="text-xs text-muted-foreground">Farcaster Activity Analytics</p>
              </div>
            </div>
            {isConnected ? (
              <Button variant="outline" size="sm" disabled>
                Connected
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={handleConnect}>
                Connect
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <Card className="mx-auto max-w-2xl p-8">
            <div className="text-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </Card>
        ) : !isConnected || !userId ? (
          <Card className="mx-auto max-w-2xl p-8">
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Get Started</h2>
                <p className="text-muted-foreground">
                  Connect your Farcaster account to track your social activity
                </p>
              </div>
              <Button className="w-full" size="lg" onClick={handleConnect}>
                Connect Farcaster Account
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Metrics Summary */}
            <MetricsSummary userId={userId} address="" />
          </div>
        )}
      </div>
    </div>
  )
}
