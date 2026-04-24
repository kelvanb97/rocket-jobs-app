import { company, role, score } from "@rja-app/drizzle"
import { db } from "@rja-core/drizzle"
import { errFrom, ok, type TResult } from "@rja-core/result"
import type { TListRoles, TRole } from "#schema/role-schema"
import type { SQL } from "drizzle-orm"
import {
	and,
	asc,
	desc,
	eq,
	getTableColumns,
	gte,
	like,
	lte,
} from "drizzle-orm"

export function listRoles(
	input: TListRoles,
): TResult<{ roles: TRole[]; hasNext: boolean }> {
	try {
		const page = input.page ?? 1
		const pageSize = input.pageSize ?? 25
		const sortByScore = input.sortBy === "score"
		const ascending = (input.sortOrder ?? "desc") === "asc"
		const needsCompanyJoin = !!input.search
		const needsScoreJoin =
			input.scoreMin !== undefined ||
			input.scoreMax !== undefined ||
			sortByScore

		const conditions: SQL[] = []

		if (input.status) conditions.push(eq(role.status, input.status))
		if (input.locationType)
			conditions.push(eq(role.locationType, input.locationType))
		if (input.source) conditions.push(eq(role.source, input.source))
		if (input.companyId)
			conditions.push(eq(role.companyId, input.companyId))
		if (input.search)
			conditions.push(like(company.name, `%${input.search}%`))
		if (needsScoreJoin && input.scoreMin !== undefined)
			conditions.push(gte(score.score, input.scoreMin))
		if (needsScoreJoin && input.scoreMax !== undefined)
			conditions.push(lte(score.score, input.scoreMax))

		const whereClause =
			conditions.length > 0 ? and(...conditions) : undefined

		const orderByDirection = ascending ? asc : desc
		const sortBy = input.sortBy ?? "created_at"
		const orderByClause = (() => {
			switch (sortBy) {
				case "score":
					return orderByDirection(score.score)
				case "posted_at":
					return orderByDirection(role.postedAt)
				case "title":
					return orderByDirection(role.title)
				case "status":
					return orderByDirection(role.status)
				case "created_at":
				default:
					return orderByDirection(role.createdAt)
			}
		})()

		let query = db()
			.select({ ...getTableColumns(role) })
			.from(role)
			.$dynamic()

		if (needsScoreJoin) {
			query = query.innerJoin(score, eq(role.id, score.roleId))
		}
		if (needsCompanyJoin) {
			query = query.innerJoin(company, eq(role.companyId, company.id))
		}

		const results = query
			.where(whereClause)
			.orderBy(orderByClause, asc(role.id))
			.limit(pageSize + 1)
			.offset((page - 1) * pageSize)
			.all()

		const hasNext = results.length > pageSize
		const roles = results.slice(0, pageSize)
		return ok({ roles, hasNext })
	} catch (e) {
		return errFrom(
			`Error listing roles: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
