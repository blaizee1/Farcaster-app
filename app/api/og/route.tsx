import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 48,
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "system-ui",
      }}
    >
      <div style={{ fontSize: 64, fontWeight: "bold", marginBottom: 20 }}>OnChain Pulse</div>
      <div style={{ fontSize: 32, opacity: 0.8 }}>Track Your Social & On-Chain Activity</div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  )
}
