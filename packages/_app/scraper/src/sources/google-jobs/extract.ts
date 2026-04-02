import type { Locator, Page } from "@rja-integrations/patchright/page"
import type { ScrapedRole } from "#types"
import { parsePostedAt, parseSalary } from "./parse"
import { APPLY_LINK_SELECTOR, DETAIL_PANEL_SELECTOR } from "./selectors"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

/**
 * Google wraps apply links in redirect URLs like
 * `https://www.google.com/url?q=https%3A%2F%2Fexample.com%2Fjobs&...`
 * Extract the real target URL from the `q` parameter.
 */
function unwrapGoogleRedirect(href: string): string {
	try {
		const url = new URL(href)
		if (
			url.hostname.endsWith("google.com") &&
			url.pathname === "/url" &&
			url.searchParams.has("q")
		) {
			return url.searchParams.get("q")!
		}
	} catch {
		// Not a valid URL — return as-is
	}
	return href
}

// ---------------------------------------------------------------------------
// Text-pattern classifiers — used to identify card fields by content
// ---------------------------------------------------------------------------

const SALARY_RE = /[\d,]+[Kk]?\s*[–\-–]\s*[\d,]+[Kk]?\s*a year/
const SINGLE_SALARY_RE = /[\d,]+[Kk]?\s*a year/
const POSTED_RE = /\d+\s+(hour|day|week|month)s?\s+ago/i
const EMPLOYMENT_RE =
	/^(Full-time|Part-time|Contractor|Full-time and Contractor|Internship)$/i
const REMOTE_RE = /^Work from home$/i
const BADGE_RE = /^(NEW|Hot|Reviewed)$/i

// ---------------------------------------------------------------------------
// Card-level extraction — fast, pre-click data from the list view
// ---------------------------------------------------------------------------

export type CardData = {
	title: string | null
	company: string | null
	location: string | null
	salaryText: string | null
	postedAt: string | null
	employmentType: string | null
	isRemote: boolean
}

/**
 * Extract structured data from a job card in the list panel.
 * Uses the card's full inner text and classifies each text segment
 * by content patterns rather than CSS classes.
 */
export async function extractJobFromCard(card: Locator): Promise<CardData> {
	const result: CardData = {
		title: null,
		company: null,
		location: null,
		salaryText: null,
		postedAt: null,
		employmentType: null,
		isRemote: false,
	}

	const fullText = await safeInnerText(card, 1000)
	if (!fullText) return result

	const lines = fullText
		.split("\n")
		.map((l) => l.trim())
		.filter((l) => l.length > 0)

	// Classify each line by content pattern
	const unclassified: string[] = []

	for (const line of lines) {
		if (BADGE_RE.test(line)) continue
		if (SALARY_RE.test(line) || SINGLE_SALARY_RE.test(line)) {
			result.salaryText = line
		} else if (POSTED_RE.test(line)) {
			result.postedAt = line
		} else if (EMPLOYMENT_RE.test(line)) {
			result.employmentType = line
		} else if (REMOTE_RE.test(line)) {
			result.isRemote = true
		} else if (
			line === "Save" ||
			line === "Saved" ||
			line === "Share" ||
			line.startsWith("Add ") ||
			line.startsWith("Remove ") ||
			line.startsWith("Click to copy") ||
			line === "Share link" ||
			line === "Link copied" ||
			line === "Close" ||
			line === "Facebook" ||
			line === "WhatsApp" ||
			line === "X" ||
			line === "Email"
		) {
			continue
		} else if (line.includes("insurance") || line.includes("Paid time")) {
			continue // Benefits tags
		} else if (line.startsWith("Qualification")) {
			continue
		} else {
			unclassified.push(line)
		}
	}

	// The first unclassified line is the title, second is company, third is location
	if (unclassified.length > 0) result.title = unclassified[0]!
	if (unclassified.length > 1) result.company = unclassified[1]!
	if (unclassified.length > 2) result.location = unclassified[2]!

	return result
}

// ---------------------------------------------------------------------------
// Panel-level extraction — full data after clicking a card
// ---------------------------------------------------------------------------

async function extractDescriptionFromPanel(
	panel: Locator,
): Promise<string | null> {
	// Find the "Job description" heading and take its next sibling's text
	const headings = panel.locator("h3")
	const count = await headings.count()

	for (let i = 0; i < count; i++) {
		const heading = headings.nth(i)
		const text = await safeInnerText(heading)
		if (text && /job description/i.test(text)) {
			// Get the sibling element after this heading
			const desc = await heading.evaluate((el) => {
				const sibling = el.nextElementSibling
				return sibling?.textContent?.trim() ?? null
			})
			if (desc && desc.length > 20) return desc
		}
	}

	return null
}

async function extractApplyUrls(panel: Locator): Promise<{
	applyUrl: string | null
	applicationUrl: string | null
}> {
	const links = panel.locator(APPLY_LINK_SELECTOR)
	const count = await links.count()

	if (count === 0) return { applyUrl: null, applicationUrl: null }

	let firstUrl: string | null = null
	let canonicalUrl: string | null = null

	for (let i = 0; i < count; i++) {
		const link = links.nth(i)
		const href = await link.getAttribute("href").catch(() => null)
		if (!href) continue

		const realUrl = unwrapGoogleRedirect(href)
		const text = (await safeInnerText(link)) ?? ""

		if (!firstUrl) firstUrl = realUrl

		// "Apply directly on X" links are the canonical/company-direct links
		if (/apply directly/i.test(text)) {
			canonicalUrl = realUrl
		}
	}

	return {
		applyUrl: firstUrl,
		applicationUrl: canonicalUrl ?? firstUrl,
	}
}

/**
 * Extract full job data from the detail panel that appears after clicking a card.
 * Merges with pre-extracted card data for fields not present in the panel.
 */
export async function extractJobFromPanel(
	page: Page,
	cardData: CardData,
): Promise<ScrapedRole | null> {
	const panel = page.locator(DETAIL_PANEL_SELECTOR).first()
	if ((await panel.count()) === 0) return null

	// Title — try the detail panel's title element, fall back to card data
	const panelTitle =
		(await safeInnerText(panel.locator("h2").first())) ??
		(await safeInnerText(panel.locator('[role="heading"]').first()))
	const title = panelTitle ?? cardData.title

	if (!title) {
		console.warn("[google-jobs] Skipping job with no title")
		return null
	}

	// Description
	const description = await extractDescriptionFromPanel(panel)

	// Apply URLs
	const { applyUrl, applicationUrl } = await extractApplyUrls(panel)

	// Salary and date from card data (already extracted)
	const salary = parseSalary(cardData.salaryText)

	return {
		title,
		url: applicationUrl ?? applyUrl,
		company: cardData.company,
		description,
		source: "google-jobs",
		location_type: cardData.isRemote ? "remote" : null,
		location: cardData.location,
		salary_min: salary.min,
		salary_max: salary.max,
		posted_at: parsePostedAt(cardData.postedAt),
	}
}
