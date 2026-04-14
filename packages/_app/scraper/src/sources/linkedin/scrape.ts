import {
	BotBlockedError,
	CaptchaDetectedError,
} from "@rja-integrations/patchright/errors"
import { randomWait } from "@rja-integrations/patchright/interaction"
import type {
	BrowserContext,
	Locator,
	Page,
} from "@rja-integrations/patchright/page"
import { checkForBlocks } from "@rja-integrations/patchright/page"
import type { ScrapedRole, TSourceScrapeOptions } from "#types"
import { extractJobFromPanel } from "./extract"
import {
	CARD_SELECTOR,
	PAGE_STATE_SELECTOR,
	PAGINATION_SELECTOR,
} from "./selectors"

const LINKEDIN_MODAL_SELECTOR = [
	"[data-test-modal-container]",
	".artdeco-modal-overlay",
	".artdeco-modal",
].join(", ")

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

async function closeLinkedinModalOverlay(page: Page): Promise<void> {
	const overlay = page.locator(LINKEDIN_MODAL_SELECTOR).first()

	await page.keyboard.press("Escape").catch(() => {})

	const dismissSelectors = [
		'button[aria-label="Dismiss"]',
		'button[aria-label="Close"]',
		".artdeco-modal__dismiss",
	]
	for (const selector of dismissSelectors) {
		const button = page.locator(selector).first()
		if (await button.isVisible().catch(() => false)) {
			await button.click({ timeout: 2_000 }).catch(() => {})
		}
	}

	const dismissNames = [/dismiss/i, /close/i, /not now/i, /got it/i, /skip/i]
	for (const name of dismissNames) {
		const button = page.getByRole("button", { name }).first()
		if (await button.isVisible().catch(() => false)) {
			await button.click({ timeout: 2_000 }).catch(() => {})
		}
	}

	await overlay.waitFor({ state: "hidden", timeout: 3_000 }).catch(() => {})

	if (await overlay.isVisible().catch(() => false)) {
		throw new Error("LinkedIn modal overlay is still blocking the page.")
	}
}

async function maybeHandleRecoverableIssue(
	page: Page,
	err: unknown,
	onHandoff: TSourceScrapeOptions["onHandoff"],
): Promise<boolean> {
	if (!onHandoff) return false

	const message = err instanceof Error ? err.message : String(err)
	const currentUrl = page.url()

	if (err instanceof CaptchaDetectedError) {
		await onHandoff({
			source: "linkedin",
			reasonCode: "captcha",
			message:
				"LinkedIn presented a CAPTCHA or human-verification challenge. Complete it in the live browser, then resume the scrape.",
			currentUrl,
			preferredActor: "user",
			resumeMode: "in_place",
		})
		return true
	}

	if (err instanceof BotBlockedError) {
		await onHandoff({
			source: "linkedin",
			reasonCode: "bot_block",
			message:
				"LinkedIn blocked the scrape with an anti-bot check. Resolve it in the live browser, then resume the scrape.",
			currentUrl,
			preferredActor: "user",
			resumeMode: "in_place",
		})
		return true
	}

	if (
		/captcha|are you a robot|verify you(?:'|’)re human|security verification/i.test(
			message,
		)
	) {
		await onHandoff({
			source: "linkedin",
			reasonCode: "captcha",
			message:
				"LinkedIn needs human verification before the scrape can continue. Complete it in the live browser, then resume the scrape.",
			currentUrl,
			preferredActor: "user",
			resumeMode: "in_place",
		})
		return true
	}

	if (
		/intercepts pointer events|artdeco-modal-overlay|data-test-modal-container|modal-overlay/i.test(
			message,
		)
	) {
		await onHandoff({
			source: "linkedin",
			reasonCode: "modal_overlay",
			message:
				"LinkedIn opened a blocking modal overlay. Hand control over to let your agent dismiss it automatically, or resolve it yourself in the live browser.",
			currentUrl,
			preferredActor: "harness",
			resumeMode: "in_place",
			recoverByHarness: async () => {
				await closeLinkedinModalOverlay(page)
			},
		})
		return true
	}

	return false
}

async function clickJobCard(
	page: Page,
	card: Locator,
	onHandoff: TSourceScrapeOptions["onHandoff"],
): Promise<boolean> {
	try {
		await checkForBlocks(page)
		await card.scrollIntoViewIfNeeded()
		await card.click({ timeout: 2_000 }).catch(async () => {
			await card.locator("a").first().click({ timeout: 2_000 })
		})
		return true
	} catch (err) {
		const handled = await maybeHandleRecoverableIssue(page, err, onHandoff)
		if (handled) return false
		throw err
	}
}

async function scrapeResultsPage(
	page: Page,
	cards: Locator,
	seen: Set<string>,
	maxPerPage: number,
	onHandoff: TSourceScrapeOptions["onHandoff"],
): Promise<ScrapedRole[]> {
	const pageRoles: ScrapedRole[] = []
	const maxNoGrowth = 3
	let i = 0
	let noGrowth = 0

	while (i < maxPerPage) {
		const count = await cards.count()

		if (i < count) {
			const card = cards.nth(i)
			const clicked = await clickJobCard(page, card, onHandoff)
			if (!clicked) continue

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
	context: BrowserContext,
	config: TLinkedinConfig,
	options?: TSourceScrapeOptions,
): Promise<ScrapedRole[]> {
	const { onRole, onHandoff, signal } = options ?? {}
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
			try {
				await checkForBlocks(page)
			} catch (err) {
				const handled = await maybeHandleRecoverableIssue(
					page,
					err,
					onHandoff,
				)
				if (handled) continue
				throw err
			}

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
					onHandoff,
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
		await page.close().catch(() => {})
	}

	console.log(
		`[linkedin] Scraping complete, ${totalPages} pages, found ${allRoles.length} total roles`,
	)

	return allRoles
}
