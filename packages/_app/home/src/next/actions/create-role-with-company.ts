"use server"

import { createCompany } from "@rja-api/company/api/create-company"
import {
	companySizeSchema,
	companyStageSchema,
} from "@rja-api/company/schema/company-schema"
import { createRole } from "@rja-api/role/api/create-role"
import {
	locationTypeSchema,
	roleSourceSchema,
} from "@rja-api/role/schema/role-schema"
import { actionClient, SafeForClientError } from "@rja-core/next-safe-action"
import { z } from "zod"

const createRoleWithCompanySchema = z.object({
	company: z
		.object({
			name: z.string().min(1),
			website: z.string().optional(),
			linkedinUrl: z.string().optional(),
			size: companySizeSchema.optional(),
			stage: companyStageSchema.optional(),
			industry: z.string().optional(),
			notes: z.string().optional(),
		})
		.optional(),
	title: z.string().min(1),
	url: z.string().optional(),
	description: z.string().optional(),
	source: roleSourceSchema.optional(),
	locationType: locationTypeSchema.optional(),
	location: z.string().optional(),
	salaryMin: z.number().optional(),
	salaryMax: z.number().optional(),
	notes: z.string().optional(),
})

export const createRoleWithCompanyAction = actionClient
	.inputSchema(createRoleWithCompanySchema)
	.action(async ({ parsedInput }) => {
		let companyId: number | undefined

		if (parsedInput.company) {
			const companyResult = createCompany(parsedInput.company)
			if (!companyResult.ok) {
				throw new SafeForClientError(companyResult.error.message)
			}
			companyId = companyResult.data.id
		}

		const roleResult = createRole({
			companyId,
			title: parsedInput.title,
			url: parsedInput.url,
			description: parsedInput.description,
			source: parsedInput.source,
			locationType: parsedInput.locationType,
			location: parsedInput.location,
			salaryMin: parsedInput.salaryMin,
			salaryMax: parsedInput.salaryMax,
			notes: parsedInput.notes,
		})

		if (!roleResult.ok) {
			throw new SafeForClientError(roleResult.error.message)
		}

		return roleResult.data
	})
