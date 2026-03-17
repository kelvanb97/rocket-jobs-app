import type { Database } from "@aja-app/supabase"
import { z } from "zod"

export type TRolePerson = {
	roleId: string
	personId: string
	relationship: string | null
}

export type TMarshalledRolePerson =
	Database["app"]["Tables"]["role_person"]["Row"]

export const linkRolePersonSchema = z.object({
	roleId: z.string(),
	personId: z.string(),
	relationship: z.string().nullable().optional(),
})

export type TLinkRolePerson = z.infer<typeof linkRolePersonSchema>

export const unlinkRolePersonSchema = z.object({
	roleId: z.string(),
	personId: z.string(),
})

export const listPersonsByRoleSchema = z.object({
	roleId: z.string(),
})

export const listRolesByPersonSchema = z.object({
	personId: z.string(),
})

export const updateRolePersonSchema = z.object({
	roleId: z.string(),
	personId: z.string(),
	relationship: z.string().nullable(),
})

export type TUpdateRolePerson = z.infer<typeof updateRolePersonSchema>
