"use server"

import {
	actionClient,
	UnknownServerError,
} from "@aja-core/next-safe-action"
import { listCompaniesSchema } from "#schema/company-schema"
import { listCompanies } from "#api/list-companies"

export const listCompaniesAction = actionClient
	.inputSchema(listCompaniesSchema)
	.action(async ({ parsedInput }) => {
		const result = await listCompanies(parsedInput)
		if (!result.ok)
			throw new UnknownServerError("listCompaniesAction", result.error)
		return {
			success: true,
			companies: result.data.companies,
			page: parsedInput.page,
			pageSize: parsedInput.pageSize,
			hasNext: result.data.hasNext,
		}
	})
