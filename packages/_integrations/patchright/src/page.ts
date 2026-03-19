import type { Page } from "patchright"
import { BotBlockedError, CaptchaDetectedError } from "./errors.js"

export type { Page }

export async function checkForBlocks(page: Page): Promise<void> {
	const url = page.url()
	if (url.includes("sorry/index") || url.includes("captcha")) {
		throw new CaptchaDetectedError(`CAPTCHA page detected at: ${url}`)
	}

	const bodyText = await page
		.locator("body")
		.innerText()
		.catch(() => "")
	if (
		bodyText.includes("unusual traffic") ||
		bodyText.includes("automated queries")
	) {
		throw new BotBlockedError("Unusual traffic message detected")
	}
}

export async function waitForSelector(
	page: Page,
	selector: string,
	timeout = 10_000,
): Promise<void> {
	await page.waitForSelector(selector, { timeout })
}

export async function extractText(
	page: Page,
	selector: string,
): Promise<string | null> {
	const el = page.locator(selector).first()
	const visible = await el.isVisible().catch(() => false)
	if (!visible) return null
	return el.innerText().catch(() => null)
}

export async function extractAttribute(
	page: Page,
	selector: string,
	attribute: string,
): Promise<string | null> {
	const el = page.locator(selector).first()
	const visible = await el.isVisible().catch(() => false)
	if (!visible) return null
	return el.getAttribute(attribute).catch(() => null)
}
