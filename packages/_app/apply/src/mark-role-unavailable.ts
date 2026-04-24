import { updateRole } from "@rja-api/role/api/update-role"
import { ok, type TResult } from "@rja-core/result"

type TMarkRoleUnavailableInput = {
	roleId: number
	reason?: string | undefined
}

export function markRoleUnavailable(
	input: TMarkRoleUnavailableInput,
): TResult<void> {
	const result = updateRole({
		id: input.roleId,
		status: "unavailable",
		...(input.reason !== undefined && { notes: input.reason }),
	})

	if (!result.ok) return result

	return ok(undefined)
}
