import type { Database } from "@aja-app/supabase"
import { errFrom, ok, type TResult } from "@aja-core/result"
import { supabaseAdminClient } from "@aja-core/supabase/admin"
import { unmarshalRole } from "#schema/role-marshallers"
import type { TListRoles, TMarshalledRole, TRole } from "#schema/role-schema"

export async function listRoles(
	input: TListRoles,
): Promise<TResult<{ roles: TRole[]; hasNext: boolean }>> {
	const supabase = supabaseAdminClient<Database>()
	const sortByScore = input.sortBy === "score"
	const ascending = (input.sortOrder ?? "desc") === "asc"
	const needsScoreJoin =
		input.scoreMin !== undefined ||
		input.scoreMax !== undefined ||
		sortByScore

	const start = (input.page - 1) * input.pageSize
	const end = start + input.pageSize

	// Inner join with score table when filtering/sorting by score to avoid
	// fetching all matching IDs via .in() which causes URI-too-long errors.
	let query = needsScoreJoin
		? supabase.schema("app").from("role").select("*, score!inner(score)")
		: supabase.schema("app").from("role").select()

	if (needsScoreJoin) {
		if (input.scoreMin !== undefined) {
			query = query.gte("score.score", input.scoreMin)
		}
		if (input.scoreMax !== undefined) {
			query = query.lte("score.score", input.scoreMax)
		}
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

	if (sortByScore) {
		// PostgREST table(column) syntax orders parent rows by embedded column
		query = query.order("score(score)", { ascending })
	} else {
		query = query.order(input.sortBy ?? "created_at", { ascending })
	}

	const { data, error } = await query.order("id").range(start, end)

	if (error) return errFrom(`Error listing roles: ${error.message}`)

	const rows = data as TMarshalledRole[]
	const hasNext = rows.length > input.pageSize
	const roles = rows.slice(0, input.pageSize).map(unmarshalRole)
	return ok({ roles, hasNext })
}
