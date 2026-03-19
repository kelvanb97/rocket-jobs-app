import { SEARCH_CONFIG } from "@aja-config/profile/search"
import {
	closeBrowserContext,
	createBrowserContext,
} from "@aja-integrations/patchright/browser"
import { CaptchaDetectedError } from "@aja-integrations/patchright/errors"
import { randomWait } from "@aja-integrations/patchright/interaction"
import { checkForBlocks, type Page } from "@aja-integrations/patchright/page"
import type { ScrapedRole } from "../lib/insert.js"

type JobCard = {
	title: string | null
	company: string | null
	location: string | null
	postedAt: string | null
	description: string | null
	listingUrl: string | null
	applicationUrl: string | null
}

async function extractJobListings(page: Page): Promise<JobCard[]> {
	const cards: JobCard[] = []

	try {
		await page.waitForSelector("[data-ved][jscontroller]", {
			timeout: 8_000,
		})
	} catch {
		console.warn("[google-jobs] Timed out waiting for job cards")
		return cards
	}

	const cardElements = await page
		.locator("li.iFjolb")
		.all()
		.catch(() => [])

	if (cardElements.length === 0) {
		console.warn(
			"[google-jobs] No job cards found with selector 'li.iFjolb'",
		)
		return cards
	}

	for (const card of cardElements) {
		try {
			await card.click()
			await randomWait(800, 1_500)

			const title = await page
				.locator('[aria-label="Job details"] h2')
				.first()
				.innerText()
				.catch(() => null)

			const company = await page
				.locator('[aria-label="Job details"] [data-company-name]')
				.first()
				.getAttribute("data-company-name")
				.catch(async () =>
					page
						.locator('[aria-label="Job details"] .nJlQNd')
						.first()
						.innerText()
						.catch(() => null),
				)

			const location = await page
				.locator('[aria-label="Job details"] .Qk80Jf')
				.first()
				.innerText()
				.catch(() => null)

			const postedAt = await page
				.locator('[aria-label="Job details"] .LL4CDc')
				.first()
				.innerText()
				.catch(() => null)

			const description = await page
				.locator('[aria-label="Job details"] .NgUYpe')
				.first()
				.innerText()
				.catch(() => null)

			const listingUrl = page.url()

			const applyButton = page
				.locator('[aria-label="Job details"] a[data-url]')
				.first()
			const applicationUrl = await applyButton
				.getAttribute("data-url")
				.catch(() => null)

			if (!title) {
				console.warn(
					"[google-jobs] Missing title in job card, skipping",
				)
				continue
			}

			cards.push({
				title,
				company: company ?? null,
				location: location ?? null,
				postedAt: postedAt ?? null,
				description: description ?? null,
				listingUrl,
				applicationUrl: applicationUrl ?? null,
			})
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err)
			console.warn(`[google-jobs] Error extracting card: ${msg}`)
		}

		await randomWait(2_000, 5_000)
	}

	return cards
}

function buildSearchUrl(title: string, pageIndex: number): string {
	const params = new URLSearchParams({
		udm: "8",
		q: `${title}${SEARCH_CONFIG.remote ? " remote" : ""}`,
		chips: `date_posted:${SEARCH_CONFIG.freshnessdays}d`,
	})
	if (pageIndex > 0) {
		params.set("start", String(pageIndex * 10))
	}
	return `https://www.google.com/search?${params.toString()}`
}

function parsePostedAt(raw: string | null): string | null {
	if (!raw) return null
	const now = new Date()
	const lower = raw.toLowerCase()
	const hoursMatch = lower.match(/(\d+)\s*hour/)
	const daysMatch = lower.match(/(\d+)\s*day/)
	if (hoursMatch) {
		now.setHours(now.getHours() - parseInt(hoursMatch[1]!, 10))
		return now.toISOString().split("T")[0] ?? null
	}
	if (daysMatch) {
		now.setDate(now.getDate() - parseInt(daysMatch[1]!, 10))
		return now.toISOString().split("T")[0] ?? null
	}
	return null
}

export async function scrape(): Promise<ScrapedRole[]> {
	const context = await createBrowserContext()
	const page = await context.newPage()
	const roles: ScrapedRole[] = []

	try {
		for (const title of SEARCH_CONFIG.titles) {
			console.log(`[google-jobs] Searching: "${title}"`)

			for (
				let pageIdx = 0;
				pageIdx < SEARCH_CONFIG.maxPagesPerQuery;
				pageIdx++
			) {
				const searchUrl = buildSearchUrl(title, pageIdx)
				await page.goto(searchUrl, { waitUntil: "domcontentloaded" })

				try {
					await checkForBlocks(page)
				} catch (err) {
					if (err instanceof CaptchaDetectedError) {
						console.warn(
							`[google-jobs] CAPTCHA detected for "${title}" page ${pageIdx + 1}, skipping remaining pages`,
						)
						break
					}
					throw err
				}

				const cards = await extractJobListings(page)

				if (cards.length === 0) {
					console.log(
						`[google-jobs] No listings found for "${title}" page ${pageIdx + 1}, stopping`,
					)
					break
				}

				for (const card of cards) {
					roles.push({
						title: card.title ?? title,
						url: card.listingUrl,
						source_url: searchUrl,
						application_url: card.applicationUrl,
						company: card.company,
						description: card.description,
						source: "google-jobs",
						location_type: card.location
							?.toLowerCase()
							.includes("remote")
							? "remote"
							: null,
						location: card.location,
						salary_min: null,
						salary_max: null,
						posted_at: parsePostedAt(card.postedAt),
					})
				}

				const hasNextPage = await page
					.locator("#pnnext")
					.isVisible()
					.catch(() => false)
				if (!hasNextPage) break

				await randomWait(3_000, 8_000)
			}

			await randomWait(3_000, 8_000)
		}
	} finally {
		await closeBrowserContext(context)
	}

	return roles
}
