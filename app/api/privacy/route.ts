import { type NextRequest, NextResponse } from "next/server"

export interface PrivacySettings {
  userId: string
  address: string
  dataSharing: "public" | "private" | "signed"
  storeLocally: boolean
  excludeChains: string[]
  anonymizeData: boolean
}

// In production, store this in a database
const privacySettings = new Map<string, PrivacySettings>()

export async function POST(request: NextRequest) {
  try {
    const settings: PrivacySettings = await request.json()

    // Validate settings
    if (!settings.userId || !settings.address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Store settings
    const key = `${settings.userId}:${settings.address}`
    privacySettings.set(key, settings)

    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error("Error saving privacy settings:", error)
    return NextResponse.json({ error: "Failed to save privacy settings" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get("userId")
  const address = searchParams.get("address")

  if (!userId || !address) {
    return NextResponse.json({ error: "Missing userId or address" }, { status: 400 })
  }

  const key = `${userId}:${address}`
  const settings = privacySettings.get(key)

  if (!settings) {
    // Return default settings
    return NextResponse.json({
      userId,
      address,
      dataSharing: "public",
      storeLocally: false,
      excludeChains: [],
      anonymizeData: false,
    })
  }

  return NextResponse.json(settings)
}
