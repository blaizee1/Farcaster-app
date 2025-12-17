import { test, expect } from "@playwright/test"

test.describe("OnChain Pulse Dashboard", () => {
  test("should load home page", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("h1")).toContainText("OnChain Pulse")
  })

  test("should show input form before loading data", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator('input[placeholder*="Farcaster"]')).toBeVisible()
    await expect(page.locator('input[placeholder*="0x"]')).toBeVisible()
    await expect(page.locator('button:has-text("Load Dashboard")')).toBeVisible()
  })

  test("should enable load button when inputs are filled", async ({ page }) => {
    await page.goto("/")

    const loadButton = page.locator('button:has-text("Load Dashboard")')
    await expect(loadButton).toBeDisabled()

    await page.locator('input[placeholder*="Farcaster"]').fill("dwr.eth")
    await page.locator('input[placeholder*="0x"]').fill("0x1234567890abcdef")

    await expect(loadButton).toBeEnabled()
  })

  test("should load dashboard with metrics", async ({ page }) => {
    await page.goto("/")

    await page.locator('input[placeholder*="Farcaster"]').fill("dwr.eth")
    await page.locator('input[placeholder*="0x"]').fill("0x1234567890abcdef")
    await page.locator('button:has-text("Load Dashboard")').click()

    // Wait for metrics to load
    await expect(page.locator("text=Total Casts")).toBeVisible()
    await expect(page.locator("text=Total Likes")).toBeVisible()
  })

  test("should navigate between tabs", async ({ page }) => {
    await page.goto("/")

    await page.locator('input[placeholder*="Farcaster"]').fill("test")
    await page.locator('input[placeholder*="0x"]').fill("0xtest")
    await page.locator('button:has-text("Load Dashboard")').click()

    // Check heatmap tab
    await page.locator('button:has-text("Heatmap")').click()
    await expect(page.locator("text=Activity Heatmap")).toBeVisible()

    // Check hourly tab
    await page.locator('button:has-text("Hourly")').click()
    await expect(page.locator("text=Hourly Density")).toBeVisible()

    // Check timeline tab
    await page.locator('button:has-text("Timeline")').click()
    await expect(page.locator("text=Interactive Timeline")).toBeVisible()
  })
})
