import type { Database } from "@aja-app/supabase"
import { z } from "zod"

export type TPerson = {
	id: string
	companyId: string | null
	name: string
	title: string | null
	email: string | null
	linkedinUrl: string | null
	notes: string | null
	createdAt: string | null
	updatedAt: string | null
}

export type TMarshalledPerson = Database["app"]["Tables"]["person"]["Row"]

export const getPersonSchema = z.object({
	id: z.string(),
})

export const listPersonsSchema = z.object({
	page: z.number().min(1).default(1),
	pageSize: z.number().min(1).max(100).default(25),
	search: z.string().optional(),
	email: z.string().optional(),
	companyId: z.string().optional(),
})

export type TListPersons = z.infer<typeof listPersonsSchema>

export const createPersonSchema = z.object({
	companyId: z.string().nullable().optional(),
	name: z.string().min(1),
	title: z.string().nullable().optional(),
	email: z.string().nullable().optional(),
	linkedinUrl: z.string().nullable().optional(),
	notes: z.string().nullable().optional(),
})

export type TCreatePerson = z.infer<typeof createPersonSchema>

export const updatePersonSchema = z.object({
	id: z.string(),
	companyId: z.string().nullable().optional(),
	name: z.string().min(1).optional(),
	title: z.string().nullable().optional(),
	email: z.string().nullable().optional(),
	linkedinUrl: z.string().nullable().optional(),
	notes: z.string().nullable().optional(),
})

export type TUpdatePerson = z.infer<typeof updatePersonSchema>

export const deletePersonSchema = z.object({
	id: z.string(),
})
