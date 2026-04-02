import {
	closeBrowserContext,
	createBrowserContext,
} from "@rja-integrations/patchright/browser"
import { randomWait } from "@rja-integrations/patchright/interaction"
import type { Locator, Page } from "@rja-integrations/patchright/page"
import type { ScrapedRole, TSourceScrapeOptions } from "#types"
import { extractJobFromPanel } from "./extract"
import {
	CARD_SELECTOR,
	PAGE_STATE_SELECTOR,
	PAGINATION_SELECTOR,
} from "./selectors"

async function pageStateText(page: Page): Promise<string | null> {
	try {
		const loc = page.locator(PAGE_STATE_SELECTOR).first()
		const t = await loc.innerText({ timeout: 800 })
		return t ? t.replace(/\s+/g, " ").trim() : null
	} catch {
		return null
	}
}

async function firstCardKey(cards: Locator): Promise<string | null> {
	const first = cards.first()
	if ((await first.count()) === 0) return null

	const a =
		(await first
			.getAttribute("data-occludable-job-id")
			.catch(() => null)) ??
		(await first.getAttribute("data-entity-urn").catch(() => null)) ??
		null

	if (a) return a

	const t = await first.innerText({ timeout: 800 }).catch(() => null)
	return t ? t.replace(/\s+/g, " ").trim().slice(0, 80) : null
}

async function goToNextResultsPage(
	page: Page,
	cards: Locator,
): Promise<boolean> {
	const pager = page.locator(PAGINATION_SELECTOR).first()
	if ((await pager.count()) === 0) return false

	const next = pager
		.locator(
			'button.jobs-search-pagination__button--next[aria-label*="next"]',
		)
		.first()

	if ((await next.count()) === 0) return false
	if (await next.isDisabled().catch(() => false)) return false

	const prevState = await pageStateText(page)
	const prevKey = await firstCardKey(cards)

	await pager.scrollIntoViewIfNeeded().catch(() => {})
	await next.click({ timeout: 5000, noWaitAfter: true }).catch(() => {})

	const deadline = Date.now() + 15_000
	while (Date.now() < deadline) {
		const curState = await pageStateText(page)
		const curKey = await firstCardKey(cards)

		const stateChanged = prevState && curState && curState !== prevState
		const listChanged = prevKey && curKey && curKey !== prevKey

		if (stateChanged || listChanged) break
		await page.waitForTimeout(250)
	}

	await cards
		.first()
		.waitFor({ state: "visible", timeout: 10_000 })
		.catch(() => {})

	return true
}

async function scrollJobsListToBottom(cards: Locator) {
	const first = cards.first()
	if ((await first.count()) === 0) return

	await first
		.evaluate((el) => {
			function isScrollable(node: HTMLElement) {
				const style = window.getComputedStyle(node)
				const oy = style.overflowY
				return (
					(oy === "auto" || oy === "scroll") &&
					node.scrollHeight > node.clientHeight
				)
			}

			let cur: HTMLElement | null = el as HTMLElement
			while (cur) {
				if (isScrollable(cur)) {
					cur.scrollTop = cur.scrollHeight
					return
				}
				cur = cur.parentElement
			}

			window.scrollTo(0, document.body.scrollHeight)
		})
		.catch(() => {})
}

async function tryLoadMoreCards(page: Page, cards: Locator): Promise<boolean> {
	const before = await cards.count()

	const seeMore = page.getByRole("button", { name: /see more jobs/i })
	if (await seeMore.isVisible().catch(() => false)) {
		await seeMore.click({ timeout: 1500 }).catch(() => {})
	}

	await scrollJobsListToBottom(cards)
	await page.waitForTimeout(900)

	const after = await cards.count()
	return after > before
}

async function scrapeResultsPage(
	page: Page,
	cards: Locator,
	seen: Set<string>,
	maxPerPage: number,
): Promise<ScrapedRole[]> {
	const pageRoles: ScrapedRole[] = []
	const maxNoGrowth = 3
	let i = 0
	let noGrowth = 0

	while (i < maxPerPage) {
		const count = await cards.count()

		if (i < count) {
			const card = cards.nth(i)
			await card.scrollIntoViewIfNeeded()

			await card.click({ timeout: 2000 }).catch(async () => {
				await card.locator("a").first().click({ timeout: 2000 })
			})

			await page.waitForTimeout(100)

			try {
				const role = await extractJobFromPanel(page)
				if (role) {
					const key = `${role.company ?? ""}|${role.title}`
					if (!seen.has(key)) {
						seen.add(key)
						pageRoles.push(role)
						console.log(
							`[linkedin] Scraped: ${role.title} at ${role.company}`,
						)
					}
				}
			} catch (err) {
				console.warn(
					`[linkedin] Failed to extract job ${i + 1}: ${err instanceof Error ? err.message : String(err)}`,
				)
			}

			i++
			noGrowth = 0
			continue
		}

		const grew = await tryLoadMoreCards(page, cards)
		if (grew) {
			noGrowth = 0
			continue
		}

		noGrowth++
		if (noGrowth >= maxNoGrowth) break
	}

	return pageRoles
}

export type TLinkedinConfig = {
	urls: string[]
	maxPages: number
	maxPerPage: number
}

export async function scrape(
	config: TLinkedinConfig,
	options?: TSourceScrapeOptions,
): Promise<ScrapedRole[]> {
	const { onRole, signal } = options ?? {}
	const context = await createBrowserContext()
	const page = await context.newPage()
	const allRoles: ScrapedRole[] = []
	const seen = new Set<string>()
	let totalPages = 0

	try {
		for (const searchUrl of config.urls) {
			if (signal?.aborted) break

			console.log(`[linkedin] Navigating to: ${searchUrl}`)

			await page.goto(searchUrl, { waitUntil: "domcontentloaded" })
			await page.waitForTimeout(2000)

			const cards = page.locator(CARD_SELECTOR)
			const cardCount = await cards.count()

			if (cardCount === 0) {
				console.log(`[linkedin] No job cards found`)
				continue
			}

			let pagesScraped = 0

			while (pagesScraped < config.maxPages) {
				if (signal?.aborted) break

				const state =
					(await pageStateText(page)) ?? `Page ${pagesScraped + 1}`
				console.log(`[linkedin] ${state}`)

				const pageRoles = await scrapeResultsPage(
					page,
					cards,
					seen,
					config.maxPerPage,
				)

				pagesScraped++
				totalPages++

				console.log(
					`[linkedin] Page ${totalPages}: extracted ${pageRoles.length} roles`,
				)

				for (const role of pageRoles) {
					await onRole?.(role)
				}
				allRoles.push(...pageRoles)

				if (pagesScraped >= config.maxPages) break

				const moved = await goToNextResultsPage(page, cards)
				if (!moved) break

				await randomWait(2_000, 5_000)
			}

			await randomWait(3_000, 8_000)
		}
	} finally {
		await closeBrowserContext(context)
	}

	console.log(
		`[linkedin] Scraping complete, ${totalPages} pages, found ${allRoles.length} total roles`,
	)

	return allRoles
}
