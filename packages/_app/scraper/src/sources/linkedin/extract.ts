import type { Locator, Page } from "@rja-integrations/patchright/page"
import type { ScrapedRole } from "#types"
import { PANEL_SELECTOR } from "./selectors"

async function safeInnerText(
	loc: Locator,
	timeout = 800,
): Promise<string | undefined> {
	try {
		const t = await loc.first().innerText({ timeout })
		return t?.trim() || undefined
	} catch {
		return undefined
	}
}

function firstPanel(page: Page): Locator {
	return page.locator(PANEL_SELECTOR).first()
}

async function expandDescription(panel: Locator) {
	await panel
		.locator('button:has-text("See more")')
		.first()
		.click({ timeout: 800 })
		.catch(() => {})
	await panel
		.locator('button[aria-label*="See more"]')
		.first()
		.click({ timeout: 800 })
		.catch(() => {})
}

async function captureExternalApplyUrl(
	page: Page,
	panel: Locator,
): Promise<string | null> {
	const applyButton = panel
		.locator(
			'button.jobs-apply-button[data-live-test-job-apply-button]:visible[aria-label*="on company website"]',
		)
		.first()

	if ((await applyButton.count()) === 0) return null

	await applyButton.scrollIntoViewIfNeeded()
	await applyButton.waitFor({ state: "visible", timeout: 5000 })

	const popupPromise = page
		.waitForEvent("popup", { timeout: 8000 })
		.catch(() => null)
	const pagePromise = page
		.context()
		.waitForEvent("page", { timeout: 8000 })
		.catch(() => null)

	await applyButton.click({ timeout: 5000, noWaitAfter: true })

	const newPage = (await popupPromise) ?? (await pagePromise)
	if (!newPage) return null

	await newPage.waitForLoadState("domcontentloaded").catch(() => {})
	const url = newPage.url()
	await newPage.close().catch(() => {})
	return url || null
}

function parseSalary(text: string | null): {
	min: number | null
	max: number | null
} {
	if (!text) return { min: null, max: null }
	const match = text.match(/\$(\d[\d,]*)\s*(?:-|to)\s*\$(\d[\d,]*)/)
	if (!match?.[1] || !match[2]) return { min: null, max: null }
	return {
		min: parseInt(match[1].replace(/,/g, ""), 10),
		max: parseInt(match[2].replace(/,/g, ""), 10),
	}
}

/**
 * Extracts job data from the currently selected job panel.
 * Returns null if the job is Easy Apply (no external apply URL).
 */
export async function extractJobFromPanel(
	page: Page,
): Promise<ScrapedRole | null> {
	const panel = firstPanel(page)
	await expandDescription(panel)

	const title =
		(await safeInnerText(panel.locator("h1"))) ??
		(await safeInnerText(panel.locator("h2")))

	let companyLink = panel
		.locator(
			'.job-details-jobs-unified-top-card__company-name a[href*="/company/"]',
		)
		.first()

	if ((await companyLink.count()) === 0) {
		companyLink = panel
			.locator('a[href*="/company/"]')
			.filter({ hasText: /.+/ })
			.first()
	}

	const company = (await safeInnerText(companyLink)) ?? null

	const description =
		(await safeInnerText(
			panel.locator('div[class*="jobs-description"]'),
		)) ??
		(await safeInnerText(
			panel.locator('div[class*="description__text"]'),
		)) ??
		(await safeInnerText(panel.locator("article"))) ??
		null

	const panelText = (await safeInnerText(panel, 800)) ?? ""
	const salaryMatch = panelText.match(
		/\$\d[\d,]*\s*(?:-|to)\s*\$\d[\d,]*/i,
	)?.[0]
	const salary = parseSalary(salaryMatch ?? null)

	const applyUrl = await captureExternalApplyUrl(page, panel)

	if (!applyUrl || new URL(applyUrl).hostname.includes("linkedin.com")) {
		console.log(
			`[linkedin] Skipping Easy Apply job: ${title ?? "unknown"} at ${company ?? "unknown"}`,
		)
		return null
	}

	if (!title) {
		console.warn(`[linkedin] Skipping job with no title at ${company}`)
		return null
	}

	return {
		title,
		url: applyUrl,
		company,
		description,
		source: "linkedin",
		location_type: "remote",
		location: null,
		salary_min: salary.min,
		salary_max: salary.max,
		posted_at: null,
	}
}
