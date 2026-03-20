import { GOOGLE_JOBS_SEARCH } from "@aja-config/user/scraper"
import {
	closeBrowserContext,
	createBrowserContext,
} from "@aja-integrations/patchright/browser"
import { CaptchaDetectedError } from "@aja-integrations/patchright/errors"
import {
	randomWait,
	scrollToBottom,
} from "@aja-integrations/patchright/interaction"
import { checkForBlocks } from "@aja-integrations/patchright/page"
import type { Response } from "@aja-integrations/patchright/page"
import type { ScrapedRole } from "../../lib/insert"
import { extractJobEntries, unescapeXhrBody } from "./extract"
import { parsePostedAt, parseSalary } from "./parse"

function buildSearchUrl(title: string): string {
	const queryParts = [title]
	if (GOOGLE_JOBS_SEARCH.remote) queryParts.push("remote")
	if (GOOGLE_JOBS_SEARCH.freshnessdays)
		queryParts.push(`in the last ${GOOGLE_JOBS_SEARCH.freshnessdays} days`)
	if (GOOGLE_JOBS_SEARCH.fullTimeOnly) queryParts.push("Full time")

	const params = new URLSearchParams({
		udm: "8",
		q: queryParts.join(" "),
	})
	return `https://www.google.com/search?${params.toString()}`
}

export async function scrape(): Promise<ScrapedRole[]> {
	const context = await createBrowserContext()
	const page = await context.newPage()
	const roles: ScrapedRole[] = []
	const seenDocIds = new Set<string>()

	try {
		for (const title of GOOGLE_JOBS_SEARCH.titles) {
			console.log(`[google-jobs] Searching: "${title}"`)

			const xhrBodies: string[] = []
			const handler = async (response: Response) => {
				if (response.url().includes("/async/callback:550")) {
					const body = await response.text().catch(() => null)
					if (body) {
						xhrBodies.push(body)
						console.log(
							`[google-jobs] Captured XHR response (${body.length} bytes)`,
						)
					}
				}
			}
			page.on("response", handler)

			const searchUrl = buildSearchUrl(title)
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

			await scrollToBottom(page)

			const html = await page.content()
			const jobs = extractJobEntries(html)
			console.log(`[google-jobs] Extracted ${jobs.length} jobs from DOM`)

			for (const body of xhrBodies) {
				const xhrJobs = extractJobEntries(unescapeXhrBody(body))
				console.log(
					`[google-jobs] Extracted ${xhrJobs.length} jobs from XHR response`,
				)
				jobs.push(...xhrJobs)
			}

			if (jobs.length === 0) {
				console.log(`[google-jobs] No listings found for "${title}"`)
				continue
			}

			console.log(
				`[google-jobs] Found ${jobs.length} listings for "${title}"`,
			)

			for (const job of jobs) {
				if (job.docId && seenDocIds.has(job.docId)) continue
				if (job.docId) seenDocIds.add(job.docId)

				const salary = parseSalary(job.salaryText)

				roles.push({
					title: job.title || title,
					url: job.applyUrl,
					source_url: searchUrl,
					application_url: job.applicationUrl,
					company: job.company,
					description: job.description,
					source: "google-jobs",
					location_type: job.location
						?.toLowerCase()
						.includes("remote")
						? "remote"
						: null,
					location: job.location,
					salary_min: salary.min,
					salary_max: salary.max,
					posted_at: parsePostedAt(job.postedAt),
				})
			}

			page.off("response", handler)
			xhrBodies.length = 0

			await randomWait(3_000, 8_000)
		}
	} finally {
		await closeBrowserContext(context)
	}

	return roles
}
