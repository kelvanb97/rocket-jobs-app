import { z } from "zod"

export type { TInteraction, TNewInteraction } from "@rja-app/drizzle"

export const INTERACTION_TYPES = [
	"Email",
	"Call",
	"Interview",
	"LinkedIn Touch",
	"Note",
	"Other",
] as const

export type TInteractionType = (typeof INTERACTION_TYPES)[number]

export const interactionTypeSchema = z.enum(INTERACTION_TYPES)

export const getInteractionSchema = z.object({
	id: z.number(),
})

export const listInteractionsSchema = z.object({
	page: z.number().min(1).default(1),
	pageSize: z.number().min(1).max(100).default(25),
	roleId: z.number().optional(),
	personId: z.number().optional(),
	type: interactionTypeSchema.optional(),
})

export type TListInteractions = z.infer<typeof listInteractionsSchema>

export const createInteractionSchema = z.object({
	roleId: z.number().nullable().optional(),
	personId: z.number().nullable().optional(),
	type: interactionTypeSchema,
	notes: z.string().nullable().optional(),
})

export type TCreateInteraction = z.infer<typeof createInteractionSchema>

export const updateInteractionSchema = z.object({
	id: z.number(),
	roleId: z.number().nullable().optional(),
	personId: z.number().nullable().optional(),
	type: interactionTypeSchema.optional(),
	notes: z.string().nullable().optional(),
})

export type TUpdateInteraction = z.infer<typeof updateInteractionSchema>

export const deleteInteractionSchema = z.object({
	id: z.number(),
})
