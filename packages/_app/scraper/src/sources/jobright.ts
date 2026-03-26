import { JOBRIGHT_SEARCH } from "@aja-config/user/scraper"
import {
	closeBrowserContext,
	createBrowserContext,
} from "@aja-integrations/patchright/browser"
import {
	humanScroll,
	randomWait,
} from "@aja-integrations/patchright/interaction"
import type { ScrapedRole, TSourceScrapeOptions } from "#types"

export async function scrape(
	options?: TSourceScrapeOptions,
): Promise<ScrapedRole[]> {
	const { onBatch, onProgress, signal } = options ?? {}
	const context = await createBrowserContext()
	const page = await context.newPage()
	const allRoles: ScrapedRole[] = []
	const seen = new Set<string>()

	try {
		for (const baseUrl of JOBRIGHT_SEARCH.urls) {
			if (signal?.aborted) break

			onProgress?.({
				type: "source:status",
				source: "jobright",
				status: `Navigating to ${new URL(baseUrl).searchParams.get("q") || "jobs"}...`,
			})

			await page.goto(baseUrl, { waitUntil: "networkidle" })
			await page.waitForTimeout(2000)

			let pageCount = 0
			while (pageCount < JOBRIGHT_SEARCH.maxPages) {
				if (signal?.aborted) break

				pageCount++
				onProgress?.({
					type: "source:status",
					source: "jobright",
					status: `Scrolling and waiting (page ${pageCount})...`,
				})

				await humanScroll(page, 500)
				await page.waitForTimeout(1000)

				onProgress?.({
					type: "source:status",
					source: "jobright",
					status: `Extracting roles...`,
				})

				// Typical job card selectors for Jobright (this might need adjustment)
				const cards = page.locator('a[href*="/jobs/"]')
				const count = await cards.count()

				const pageRoles: ScrapedRole[] = []
				for (let i = 0; i < count; i++) {
					const card = cards.nth(i)
					const titleText =
						(await card.innerText().catch(() => "")) || ""
					const href = await card
						.getAttribute("href")
						.catch(() => null)

					if (titleText.trim() && href) {
						const cleanTitle =
							titleText.split("\n")[0]?.trim() || titleText.trim()
						const fullUrl = href.startsWith("http")
							? href
							: `https://jobright.ai${href}`
						const key = `${cleanTitle}|${fullUrl}`

						if (!seen.has(key)) {
							seen.add(key)
							pageRoles.push({
								title: cleanTitle,
								url: fullUrl,
								company: "Jobright Listing",
								source: "jobright",
								location: "Remote",
								location_type: "remote",
								description: null,
								salary_min: null,
								salary_max: null,
								posted_at: null,
							})
						}
					}
				}

				if (onBatch && pageRoles.length > 0) {
					await onBatch(pageRoles)
				} else {
					allRoles.push(...pageRoles)
				}

				// Simulate next page if available, or just scroll
				await humanScroll(page, 1000)
				await randomWait(1000, 2000)
			}
		}
	} finally {
		await closeBrowserContext(context)
	}

	return allRoles
}
