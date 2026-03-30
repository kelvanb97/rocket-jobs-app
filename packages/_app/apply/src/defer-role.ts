import { updateRole } from "@aja-api/role/api/update-role"
import { ok, type TResult } from "@aja-core/result"

type TDeferRoleInput = {
	roleId: number
	reason?: string | undefined
}

export function deferRole(input: TDeferRoleInput): TResult<void> {
	const result = updateRole({
		id: input.roleId,
		status: "deferred",
		...(input.reason !== undefined && { notes: input.reason }),
	})

	if (!result.ok) return result

	return ok(undefined)
}
