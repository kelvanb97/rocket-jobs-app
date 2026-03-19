import type { Page } from "patchright"

export function randomWait(min: number, max: number): Promise<void> {
	const ms = Math.floor(Math.random() * (max - min + 1)) + min
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function humanType(
	page: Page,
	selector: string,
	text: string,
): Promise<void> {
	await page.click(selector)
	for (const char of text) {
		await page.keyboard.type(char)
		await randomWait(50, 150)
	}
}

export async function humanClick(page: Page, selector: string): Promise<void> {
	const element = page.locator(selector).first()
	await element.scrollIntoViewIfNeeded()
	await randomWait(200, 600)
	await element.click()
}

export async function humanScroll(page: Page, deltaY: number): Promise<void> {
	await page.mouse.wheel(0, deltaY)
	await randomWait(100, 300)
}
