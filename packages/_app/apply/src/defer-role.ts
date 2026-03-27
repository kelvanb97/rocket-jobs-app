import { updateRole } from "@aja-api/role/api/update-role"
import { ok, type TResult } from "@aja-core/result"

type TDeferRoleInput = {
	roleId: string
	reason?: string | undefined
}

export async function deferRole(
	input: TDeferRoleInput,
): Promise<TResult<void>> {
	const result = await updateRole({
		id: input.roleId,
		status: "deferred",
		...(input.reason !== undefined && { notes: input.reason }),
	})

	if (!result.ok) return result

	return ok(undefined)
}
