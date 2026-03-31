import { z } from "zod"

export type { TScore, TNewScore } from "@rja-app/drizzle"

export const getScoreByRoleSchema = z.object({
	roleId: z.number(),
})

export const upsertScoreSchema = z.object({
	roleId: z.number(),
	score: z.number(),
	positive: z.array(z.string()).nullable().optional(),
	negative: z.array(z.string()).nullable().optional(),
})

export type TUpsertScore = z.infer<typeof upsertScoreSchema>

export const deleteScoreSchema = z.object({
	id: z.number(),
})
