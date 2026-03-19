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
	const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
		channel: "chrome",
		headless: options.headless ?? false,
		locale: "en-US",
		timezoneId: "America/Los_Angeles",
		viewport: { width: 1280, height: 900 },
	})
	return context
}

export async function closeBrowserContext(
	context: BrowserContext,
): Promise<void> {
	await context.close()
}
