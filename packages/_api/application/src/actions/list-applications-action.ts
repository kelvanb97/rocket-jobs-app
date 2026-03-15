"use server"

import {
	actionClient,
	UnknownServerError,
} from "@aja-core/next-safe-action"
import { listApplicationsSchema } from "#schema/application-schema"
import { listApplications } from "#api/list-applications"

export const listApplicationsAction = actionClient
	.inputSchema(listApplicationsSchema)
	.action(async ({ parsedInput }) => {
		const result = await listApplications(parsedInput)
		if (!result.ok)
			throw new UnknownServerError("listApplicationsAction", result.error)
		return {
			success: true,
			applications: result.data.applications,
			page: parsedInput.page,
			pageSize: parsedInput.pageSize,
			hasNext: result.data.hasNext,
		}
	})
