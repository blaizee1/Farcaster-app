"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Shield } from "lucide-react"
import type { PrivacySettings } from "@/app/api/privacy/route"

interface PrivacyControlsProps {
  userId: string
  address: string
}

export function PrivacyControls({ userId, address }: PrivacyControlsProps) {
  const [settings, setSettings] = useState<PrivacySettings>({
    userId,
    address,
    dataSharing: "public",
    storeLocally: false,
    excludeChains: [],
    anonymizeData: false,
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/privacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error("Failed to save privacy settings")
      }

      alert("Privacy settings saved successfully!")
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Failed to save privacy settings")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <div>
          <h3 className="text-lg font-semibold text-foreground">Privacy Controls</h3>
          <p className="text-sm text-muted-foreground">Manage how your data is stored and shared</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Data Sharing */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Data Sharing</Label>
          <RadioGroup
            value={settings.dataSharing}
            onValueChange={(value) =>
              setSettings({ ...settings, dataSharing: value as PrivacySettings["dataSharing"] })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="public" id="public" />
              <Label htmlFor="public" className="font-normal cursor-pointer">
                Public - Anyone can view your analytics
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="private" id="private" />
              <Label htmlFor="private" className="font-normal cursor-pointer">
                Private - Only you can view your data
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="signed" id="signed" />
              <Label htmlFor="signed" className="font-normal cursor-pointer">
                Signed Proofs - Share verified data without private keys
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Local Storage */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-medium">Store Locally</Label>
            <p className="text-sm text-muted-foreground">Keep all data on your device instead of servers</p>
          </div>
          <Switch
            checked={settings.storeLocally}
            onCheckedChange={(checked) => setSettings({ ...settings, storeLocally: checked })}
          />
        </div>

        {/* Anonymize Data */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-medium">Anonymize Data</Label>
            <p className="text-sm text-muted-foreground">Hide wallet addresses and personal identifiers</p>
          </div>
          <Switch
            checked={settings.anonymizeData}
            onCheckedChange={(checked) => setSettings({ ...settings, anonymizeData: checked })}
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? "Saving..." : "Save Privacy Settings"}
      </Button>
    </Card>
  )
}
