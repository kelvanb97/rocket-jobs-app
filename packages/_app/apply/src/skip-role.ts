import { updateRole } from "@aja-api/role/api/update-role"
import { ok, type TResult } from "@aja-core/result"

type TSkipRoleInput = {
	roleId: number
	reason?: string | undefined
}

export function skipRole(input: TSkipRoleInput): TResult<void> {
	const result = updateRole({
		id: input.roleId,
		status: "wont_do",
		...(input.reason !== undefined && { notes: input.reason }),
	})

	if (!result.ok) return result

	return ok(undefined)
}
