import { homedir } from "node:os"
import { join } from "node:path"
import { chromium, type BrowserContext } from "patchright"

const USER_DATA_DIR = join(homedir(), ".chrome-profile")

export type BrowserOptions = {
	headless?: boolean
}

export async function createBrowserContext(
	options: BrowserOptions = {},
): Promise<BrowserContext> {
	const launchOptions: any = {
		channel: process.env["BROWSER_CHANNEL"] as any, // "chrome", "msedge", or undefined for chromium
		headless: options.headless ?? (process.env["NODE_ENV"] === "production" || !!process.env["DOCKER"]),
		locale: "en-US",
		timezoneId: "America/Los_Angeles",
		viewport: { width: 1280, height: 900 },
	}

	if (process.env["PUPPETEER_EXECUTABLE_PATH"]) {
		launchOptions.executablePath = process.env["PUPPETEER_EXECUTABLE_PATH"]
	}

	const context = await chromium.launchPersistentContext(USER_DATA_DIR, launchOptions)
	return context
}

export async function closeBrowserContext(
	context: BrowserContext,
): Promise<void> {
	await context.close()
}
