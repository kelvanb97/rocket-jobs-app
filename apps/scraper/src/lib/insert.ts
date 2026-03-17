import { createCompany } from "@aja-api/company/api/create-company"
import { findCompanyByName } from "@aja-api/company/api/find-company-by-name"
import { createRole } from "@aja-api/role/api/create-role"
import { listRoleUrls } from "@aja-api/role/api/list-role-urls"
import type { TLocationType, TRoleSource } from "@aja-api/role/schema/role-schema"

export type ScrapedRole = {
	title: string
	url: string | null
	company: string | null
	description: string | null
	source: TRoleSource
	location_type: TLocationType | null
	location: string | null
	salary_min: number | null
	salary_max: number | null
	posted_at: string | null
}

async function resolveCompanyId(
	name: string,
	cache: Map<string, string>,
): Promise<string | null> {
	const normalized = name.trim().toLowerCase()
	const cached = cache.get(normalized)
	if (cached) return cached

	const findResult = await findCompanyByName(normalized)
	if (findResult.ok && findResult.data) {
		cache.set(normalized, findResult.data.id)
		return findResult.data.id
	}

	const createResult = await createCompany({ name: name.trim() })
	if (!createResult.ok) {
		console.warn(`Failed to create company "${name}": ${createResult.error.message}`)
		return null
	}

	cache.set(normalized, createResult.data.id)
	return createResult.data.id
}

export async function insertRoles(
	roles: ScrapedRole[],
): Promise<{ inserted: number; skipped: number }> {
	const rolesWithUrl = roles.filter(
		(r): r is ScrapedRole & { url: string } => r.url !== null && r.url !== "",
	)

	if (rolesWithUrl.length === 0) {
		return { inserted: 0, skipped: roles.length }
	}

	// Dedup by URL against existing roles (batched to avoid URI-too-long)
	const urls = rolesWithUrl.map((r) => r.url)
	const existingUrls = new Set<string>()
	const BATCH_SIZE = 20

	for (let i = 0; i < urls.length; i += BATCH_SIZE) {
		const batch = urls.slice(i, i + BATCH_SIZE)
		const urlResult = await listRoleUrls(batch)

		if (!urlResult.ok) {
			throw new Error(urlResult.error.message)
		}

		for (const url of urlResult.data) {
			existingUrls.add(url)
		}
	}
	const newRoles = rolesWithUrl.filter((r) => !existingUrls.has(r.url))
	const skipped = roles.length - newRoles.length

	if (newRoles.length === 0) {
		return { inserted: 0, skipped }
	}

	// Resolve companies and create roles
	const companyCache = new Map<string, string>()
	let inserted = 0

	for (const role of newRoles) {
		const companyId = role.company
			? await resolveCompanyId(role.company, companyCache)
			: null

		const result = await createRole({
			companyId,
			title: role.title,
			url: role.url,
			description: role.description,
			source: role.source,
			locationType: role.location_type,
			location: role.location,
			salaryMin: role.salary_min,
			salaryMax: role.salary_max,
			postedAt: role.posted_at,
		})

		if (result.ok) {
			inserted++
		} else {
			console.warn(`Failed to insert role "${role.title}": ${result.error.message}`)
		}
	}

	return { inserted, skipped }
}
