"use server"

import { updateCompany } from "@rja-api/company/api/update-company"
import {
	companySizeSchema,
	companyStageSchema,
} from "@rja-api/company/schema/company-schema"
import { updateRole } from "@rja-api/role/api/update-role"
import {
	locationTypeSchema,
	roleSourceSchema,
	roleStatusSchema,
} from "@rja-api/role/schema/role-schema"
import { actionClient, SafeForClientError } from "@rja-core/next-safe-action"
import { z } from "zod"

const updateRoleWithCompanySchema = z.object({
	role: z.object({
		id: z.number(),
		title: z.string().min(1).optional(),
		url: z.string().nullable().optional(),
		description: z.string().nullable().optional(),
		source: roleSourceSchema.nullable().optional(),
		locationType: locationTypeSchema.nullable().optional(),
		location: z.string().nullable().optional(),
		salaryMin: z.number().nullable().optional(),
		salaryMax: z.number().nullable().optional(),
		status: roleStatusSchema.optional(),
		notes: z.string().nullable().optional(),
	}),
	company: z
		.object({
			id: z.number(),
			name: z.string().min(1).optional(),
			website: z.string().nullable().optional(),
			linkedinUrl: z.string().nullable().optional(),
			size: companySizeSchema.nullable().optional(),
			stage: companyStageSchema.nullable().optional(),
			industry: z.string().nullable().optional(),
			notes: z.string().nullable().optional(),
		})
		.optional(),
})

export const updateRoleWithCompanyAction = actionClient
	.inputSchema(updateRoleWithCompanySchema)
	.action(async ({ parsedInput }) => {
		if (parsedInput.company) {
			const companyResult = updateCompany(parsedInput.company)
			if (!companyResult.ok) {
				throw new SafeForClientError(companyResult.error.message)
			}
		}

		const roleResult = updateRole(parsedInput.role)
		if (!roleResult.ok) {
			throw new SafeForClientError(roleResult.error.message)
		}

		return roleResult.data
	})
