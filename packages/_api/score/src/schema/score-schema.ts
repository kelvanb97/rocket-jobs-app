import type { Database } from "@aja-app/supabase"
import { z } from "zod"

export type TScore = {
	id: string
	roleId: string | null
	score: number
	positive: string[] | null
	negative: string[] | null
	createdAt: string | null
	updatedAt: string | null
}

export type TMarshalledScore = Database["app"]["Tables"]["score"]["Row"]

export const getScoreByRoleSchema = z.object({
	roleId: z.string(),
})

export const upsertScoreSchema = z.object({
	roleId: z.string(),
	score: z.number(),
	positive: z.array(z.string()).nullable().optional(),
	negative: z.array(z.string()).nullable().optional(),
})

export type TUpsertScore = z.infer<typeof upsertScoreSchema>

export const deleteScoreSchema = z.object({
	id: z.string(),
})
