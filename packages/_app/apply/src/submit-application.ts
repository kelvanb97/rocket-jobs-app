import { updateApplication } from "@rja-api/application/api/update-application"
import { updateRole } from "@rja-api/role/api/update-role"
import { errFrom, ok, type TResult } from "@rja-core/result"

type TSubmitInput = {
	applicationId: number
	roleId: number
}

export function submitApplication(input: TSubmitInput): TResult<void> {
	const appResult = updateApplication({
		id: input.applicationId,
		status: "submitted",
		submittedAt: new Date(),
	})
	if (!appResult.ok)
		return errFrom(
			`Failed to update application: ${appResult.error.message}`,
		)

	const roleResult = updateRole({
		id: input.roleId,
		status: "applied",
	})
	if (!roleResult.ok)
		return errFrom(`Failed to update role: ${roleResult.error.message}`)

	return ok(undefined)
}
