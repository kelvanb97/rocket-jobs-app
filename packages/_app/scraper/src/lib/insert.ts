import { createCompany } from "@rja-api/company/api/create-company"
import { findCompanyByName } from "@rja-api/company/api/find-company-by-name"
import { createRole } from "@rja-api/role/api/create-role"
import { listRoleUrls } from "@rja-api/role/api/list-role-urls"
import type { ScrapedRole } from "#types"

export type TInsertRoleResult =
	| "inserted"
	| "skipped"
	| "duplicate"
	| "filtered"

function resolveCompanyId(
	name: string,
	cache: Map<string, number>,
): number | null {
	const normalized = name.trim().toLowerCase()
	const cached = cache.get(normalized)
	if (cached) return cached

	const findResult = findCompanyByName(normalized)
	if (findResult.ok && findResult.data) {
		cache.set(normalized, findResult.data.id)
		return findResult.data.id
	}

	const createResult = createCompany({ name: name.trim() })
	if (!createResult.ok) {
		console.warn(
			`Failed to create company "${name}": ${createResult.error.message}`,
		)
		return null
	}

	cache.set(normalized, createResult.data.id)
	return createResult.data.id
}

function parsePostedAt(value: string | null): Date | null {
	if (!value) return null
	const date = new Date(value)
	return isNaN(date.getTime()) ? null : date
}

const DUPLICATE_VIOLATION = "UNIQUE constraint failed"

export function insertRole(
	role: ScrapedRole,
	companyCache: Map<string, number>,
): TInsertRoleResult {
	if (!role.url) return "skipped"

	// Check if URL already exists
	const urlResult = listRoleUrls([role.url])
	if (!urlResult.ok) {
		console.warn(`URL check failed: ${urlResult.error.message}`)
		return "skipped"
	}
	if (urlResult.data.length > 0) return "duplicate"

	// Resolve company
	const companyId = role.company
		? resolveCompanyId(role.company, companyCache)
		: null

	// Insert role
	const result = createRole({
		companyId,
		title: role.title,
		url: role.url,
		description: role.description,
		source: role.source,
		locationType: role.location_type,
		location: role.location,
		salaryMin: role.salary_min,
		salaryMax: role.salary_max,
		postedAt: parsePostedAt(role.posted_at),
	})

	if (result.ok) return "inserted"

	if (result.error.message.includes(DUPLICATE_VIOLATION)) {
		console.log(`[skip] "${role.title}" — duplicate company+title`)
		return "duplicate"
	}

	console.warn(
		`Failed to insert role "${role.title}": ${result.error.message}`,
	)
	return "skipped"
}
