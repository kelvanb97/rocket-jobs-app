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
	type TLaunchOptions = Parameters<typeof chromium.launchPersistentContext>[1]

	const launchOptions: TLaunchOptions = {
		channel: process.env["BROWSER_CHANNEL"] ?? ("chrome" as string), // "chrome", "msedge", or undefined for chromium
		headless:
			options.headless ??
			(process.env["NODE_ENV"] === "production" ||
				!!process.env["DOCKER"]),
		locale: "en-US",
		timezoneId: "America/Los_Angeles",
		viewport: { width: 1280, height: 900 },
		...(process.env["PUPPETEER_EXECUTABLE_PATH"]
			? { executablePath: process.env["PUPPETEER_EXECUTABLE_PATH"] }
			: {}),
	}

	const context = await chromium.launchPersistentContext(
		USER_DATA_DIR,
		launchOptions,
	)
	return context
}

export async function closeBrowserContext(
	context: BrowserContext,
): Promise<void> {
	await context.close()
}
