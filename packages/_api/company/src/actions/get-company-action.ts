"use server"

import {
	actionClient,
	UnknownServerError,
} from "@aja-core/next-safe-action"
import { getCompanySchema } from "#schema/company-schema"
import { getCompany } from "#api/get-company"

export const getCompanyAction = actionClient
	.inputSchema(getCompanySchema)
	.action(async ({ parsedInput }) => {
		const result = await getCompany(parsedInput.id)
		if (!result.ok)
			throw new UnknownServerError("getCompanyAction", result.error)
		return { success: true, company: result.data }
	})
