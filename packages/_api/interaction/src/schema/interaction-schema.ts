import { z } from "zod"
import type { Database } from "@aja-app/supabase"

export type TInteraction = {
	id: string
	roleId: string | null
	personId: string | null
	type: string
	notes: string | null
	createdAt: string | null
	updatedAt: string | null
}

export type TMarshalledInteraction = Database["app"]["Tables"]["interaction"]["Row"]

export const getInteractionSchema = z.object({
	id: z.string(),
})

export const listInteractionsSchema = z.object({
	page: z.number().min(1).default(1),
	pageSize: z.number().min(1).max(100).default(25),
	roleId: z.string().optional(),
	personId: z.string().optional(),
	type: z.string().optional(),
})

export type TListInteractions = z.infer<typeof listInteractionsSchema>

export const createInteractionSchema = z.object({
	roleId: z.string().nullable().optional(),
	personId: z.string().nullable().optional(),
	type: z.string().min(1),
	notes: z.string().nullable().optional(),
})

export type TCreateInteraction = z.infer<typeof createInteractionSchema>

export const updateInteractionSchema = z.object({
	id: z.string(),
	roleId: z.string().nullable().optional(),
	personId: z.string().nullable().optional(),
	type: z.string().min(1).optional(),
	notes: z.string().nullable().optional(),
})

export type TUpdateInteraction = z.infer<typeof updateInteractionSchema>

export const deleteInteractionSchema = z.object({
	id: z.string(),
})
