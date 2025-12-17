import type { Metadata } from "next"
import { DashboardView } from "@/components/dashboard-view"

export const metadata: Metadata = {
  title: "OnChain Pulse - Track Your Social & On-Chain Activity",
  description: "Visualize your Farcaster social metrics overlaid with on-chain activity heatmaps",
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/og`,
    "fc:frame:button:1": "Open App",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
}

export default function HomePage() {
  return <DashboardView />
}
