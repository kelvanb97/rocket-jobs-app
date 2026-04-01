import {
	closeBrowserContext,
	createBrowserContext,
} from "@rja-integrations/patchright/browser"
import { CaptchaDetectedError } from "@rja-integrations/patchright/errors"
import {
	humanScroll,
	randomWait,
} from "@rja-integrations/patchright/interaction"
import { checkForBlocks } from "@rja-integrations/patchright/page"
import type { Page } from "@rja-integrations/patchright/page"
import type { ScrapedRole, TSourceScrapeOptions } from "#types"
import { extractJobFromCard, extractJobFromPanel } from "./extract"
import { CARD_SELECTOR, DETAIL_PANEL_SELECTOR } from "./selectors"

export type TGoogleJobsConfig = {
	titles: string[]
	remote: boolean
	fullTimeOnly: boolean
	freshnessDays: number
	maxPagesPerQuery: number
}

function buildSearchUrl(title: string, config: TGoogleJobsConfig): string {
	const queryParts = [title]
	if (config.remote) queryParts.push("remote")
	if (config.freshnessDays)
		queryParts.push(`in the last ${config.freshnessDays} days`)
	if (config.fullTimeOnly) queryParts.push("Full time")

	const params = new URLSearchParams({
		udm: "8",
		q: queryParts.join(" "),
	})
	return `https://www.google.com/search?${params.toString()}`
}

/**
 * Wait for the detail panel to update after clicking a card.
 * Polls for up to 3 seconds checking if the panel title has changed.
 */
async function waitForPanelUpdate(
	page: Page,
	previousTitle: string | null,
): Promise<void> {
	const deadline = Date.now() + 3_000
	while (Date.now() < deadline) {
		const panel = page.locator(DETAIL_PANEL_SELECTOR).first()
		if ((await panel.count()) === 0) {
			await page.waitForTimeout(200)
			continue
		}
		const currentTitle = await panel
			.locator("h2")
			.first()
			.innerText({ timeout: 500 })
			.catch(() => null)

		if (currentTitle && currentTitle !== previousTitle) return
		await page.waitForTimeout(200)
	}
}

/**
 * Scroll down and wait for more cards to load.
 * Returns true if new cards appeared.
 */
async function scrollForMoreCards(
	page: Page,
	previousCount: number,
): Promise<boolean> {
	await humanScroll(page, 800)

	// Poll for up to 5 seconds for new cards to load
	const deadline = Date.now() + 5_000
	while (Date.now() < deadline) {
		const currentCount = await page.locator(CARD_SELECTOR).count()
		if (currentCount > previousCount) return true

		// Check if loading indicator is active — wait for it
		const loading = page.locator('[role="progressbar"]').first()
		if (await loading.isVisible().catch(() => false)) {
			await page.waitForTimeout(500)
			continue
		}

		// Check for "Try again" button and click it
		const tryAgain = page
			.getByRole("button", { name: /try again/i })
			.first()
		if (await tryAgain.isVisible().catch(() => false)) {
			await tryAgain.click({ timeout: 2000 }).catch(() => {})
			await page.waitForTimeout(2000)
			const afterRetry = await page.locator(CARD_SELECTOR).count()
			return afterRetry > previousCount
		}

		await page.waitForTimeout(500)
	}

	return false
}

export async function scrape(
	config: TGoogleJobsConfig,
	options?: TSourceScrapeOptions,
): Promise<ScrapedRole[]> {
	const { onBatch, signal } = options ?? {}
	const context = await createBrowserContext()
	const page = await context.newPage()
	const allRoles: ScrapedRole[] = []
	const seen = new Set<string>()

	try {
		for (const title of config.titles) {
			if (signal?.aborted) break

			console.log(`[google-jobs] Searching: "${title}"`)

			const searchUrl = buildSearchUrl(title, config)
			await page.goto(searchUrl, { waitUntil: "domcontentloaded" })

			try {
				await checkForBlocks(page)
			} catch (err) {
				if (err instanceof CaptchaDetectedError) {
					console.warn(
						`[google-jobs] CAPTCHA detected for "${title}", skipping`,
					)
					continue
				}
				throw err
			}

			// Wait for cards to appear
			await page
				.locator(CARD_SELECTOR)
				.first()
				.waitFor({ state: "visible", timeout: 15_000 })
				.catch(() => {})

			const cards = page.locator(CARD_SELECTOR)
			const initialCount = await cards.count()

			if (initialCount === 0) {
				console.log(`[google-jobs] No listings found for "${title}"`)
				continue
			}

			console.log(
				`[google-jobs] Found ${initialCount} initial cards for "${title}"`,
			)

			const titleRoles: ScrapedRole[] = []
			let i = 0
			let scrollAttempts = 0
			let previousPanelTitle: string | null = null

			while (scrollAttempts < config.maxPagesPerQuery) {
				if (signal?.aborted) break

				const cardCount = await cards.count()

				if (i < cardCount) {
					const card = cards.nth(i)

					// Pre-extract card-level data
					const cardData = await extractJobFromCard(card)

					// Click to open detail panel
					await card.scrollIntoViewIfNeeded().catch(() => {})
					await card.click({ timeout: 3000 }).catch(() => {})
					await waitForPanelUpdate(page, previousPanelTitle)

					// Extract full data from detail panel
					const role = await extractJobFromPanel(page, cardData)

					if (role) {
						const key = `${role.company ?? ""}|${role.title}`
						if (!seen.has(key)) {
							seen.add(key)
							titleRoles.push(role)
							console.log(
								`[google-jobs] Scraped: ${role.title} at ${role.company}`,
							)
						}
						previousPanelTitle = role.title
					}

					i++
					continue
				}

				// All visible cards processed — try scrolling for more
				const grew = await scrollForMoreCards(page, cardCount)
				if (!grew) {
					scrollAttempts++
					if (scrollAttempts >= config.maxPagesPerQuery) break
				}
			}

			console.log(
				`[google-jobs] Extracted ${titleRoles.length} roles for "${title}"`,
			)

			if (onBatch && titleRoles.length > 0) {
				await onBatch(titleRoles)
			} else {
				allRoles.push(...titleRoles)
			}

			await randomWait(3_000, 8_000)
		}
	} finally {
		await closeBrowserContext(context)
	}

	console.log(
		`[google-jobs] Scraping complete, found ${onBatch ? "roles saved per-batch" : `${allRoles.length} total roles`}`,
	)

	return allRoles
}
