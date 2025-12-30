'use client'
import { DashboardView } from "@/components/dashboard-view"
import { useEffect } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

export default function HomePage() {
  useEffect(() => {
    sdk.actions.ready()
  }, [])

  return <DashboardView />
}
