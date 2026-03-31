import { z } from "zod"

export type { TNewRolePerson, TRolePerson } from "@rja-app/drizzle"

export const ROLE_PERSON_RELATIONSHIPS = [
	"Recruiter",
	"Hiring Manager",
	"Engineer",
	"Referral",
	"Other",
] as const

export const linkRolePersonSchema = z.object({
	roleId: z.number(),
	personId: z.number(),
	relationship: z.string().nullable().optional(),
})

export type TLinkRolePerson = z.infer<typeof linkRolePersonSchema>

export const unlinkRolePersonSchema = z.object({
	roleId: z.number(),
	personId: z.number(),
})

export const listPersonsByRoleSchema = z.object({
	roleId: z.number(),
})

export const listRolesByPersonSchema = z.object({
	personId: z.number(),
})

export const updateRolePersonSchema = z.object({
	roleId: z.number(),
	personId: z.number(),
	relationship: z.string().nullable(),
})

export type TUpdateRolePerson = z.infer<typeof updateRolePersonSchema>
