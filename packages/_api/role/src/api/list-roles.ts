import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase/admin"
import { unmarshalRole } from "#schema/role-marshallers"
import type { TListRoles, TRole } from "#schema/role-schema"

async function getScoreFilteredRoleIds(
	supabase: ReturnType<typeof supabaseAdminClient<Database>>,
	scoreMin?: number,
	scoreMax?: number,
	sortByScore?: boolean,
	ascending?: boolean,
): Promise<{
	ids: string[] | null
	orderedIds: string[] | null
	error: string | null
}> {
	const needsScoreQuery =
		scoreMin !== undefined || scoreMax !== undefined || sortByScore

	if (!needsScoreQuery) return { ids: null, orderedIds: null, error: null }

	let scoreQuery = supabase
		.schema("app")
		.from("score")
		.select("role_id, score")

	if (scoreMin !== undefined) {
		scoreQuery = scoreQuery.gte("score", scoreMin)
	}
	if (scoreMax !== undefined) {
		scoreQuery = scoreQuery.lte("score", scoreMax)
	}

	if (sortByScore) {
		scoreQuery = scoreQuery.order("score", {
			ascending: ascending ?? false,
		})
	}

	const { data, error } = await scoreQuery

	if (error) return { ids: null, orderedIds: null, error: error.message }

	const ids = data
		.map((r) => r.role_id)
		.filter((id): id is string => id !== null)

	return {
		ids,
		orderedIds: sortByScore ? ids : null,
		error: null,
	}
}

export async function listRoles(
	input: TListRoles,
): Promise<TResult<{ roles: TRole[]; hasNext: boolean }>> {
	const supabase = supabaseAdminClient<Database>()

	const sortByScore = input.sortBy === "score"
	const ascending = (input.sortOrder ?? "desc") === "asc"

	const scoreResult = await getScoreFilteredRoleIds(
		supabase,
		input.scoreMin,
		input.scoreMax,
		sortByScore,
		ascending,
	)

	if (scoreResult.error)
		return errFrom(`Error filtering by score: ${scoreResult.error}`)

	const start = (input.page - 1) * input.pageSize
	const end = start + input.pageSize

	let query = supabase.schema("app").from("role").select()

	if (scoreResult.ids !== null) {
		if (scoreResult.ids.length === 0) {
			return ok({ roles: [], hasNext: false })
		}
		query = query.in("id", scoreResult.ids)
	}

	if (input.search) {
		query = query.ilike("title", `%${input.search}%`)
	}
	if (input.companyId) {
		query = query.eq("company_id", input.companyId)
	}
	if (input.status) {
		query = query.eq("status", input.status)
	}
	if (input.locationType) {
		query = query.eq("location_type", input.locationType)
	}
	if (input.source) {
		query = query.eq("source", input.source)
	}

	if (!sortByScore) {
		const sortColumn = input.sortBy ?? "created_at"
		const { data, error } = await query
			.order(sortColumn, { ascending })
			.range(start, end)

		if (error) return errFrom(`Error listing roles: ${error.message}`)

		const hasNext = data.length > input.pageSize
		const roles = data.slice(0, input.pageSize).map(unmarshalRole)
		return ok({ roles, hasNext })
	}

	// Sort by score: fetch all matching roles, reorder by score order
	const { data, error } = await query

	if (error) return errFrom(`Error listing roles: ${error.message}`)

	const roleMap = new Map(data.map((r) => [r.id, r]))
	const orderedIds = scoreResult.orderedIds ?? []
	const ordered = orderedIds
		.map((id) => roleMap.get(id))
		.filter((r) => r !== undefined)

	const hasNext = ordered.length > end
	const page = ordered.slice(start, end).map(unmarshalRole)

	return ok({ roles: page, hasNext })
}
