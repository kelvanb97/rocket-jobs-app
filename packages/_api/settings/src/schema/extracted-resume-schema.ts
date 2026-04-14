import { z } from "zod"
import { SENIORITY_LEVELS, WORK_EXPERIENCE_TYPES } from "./user-profile-schema"

/**
 * Schema describing the data the LLM is asked to extract from a resume file.
 *
 * Every field is optional because real resumes vary widely — some have no
 * summary, some omit education, some lack contact details. The preview UI
 * shows the user what was extracted and lets them pick what to apply.
 */
export const extractedResumeSchema = z.object({
	profile: z
		.object({
			name: z.string().optional(),
			email: z.string().optional(),
			phone: z.string().optional(),
			location: z.string().optional(),
			linkedin: z.string().optional(),
			github: z.string().optional(),
			personalWebsite: z.string().optional(),
			jobTitle: z.string().optional(),
			seniority: z.enum(SENIORITY_LEVELS).optional(),
			yearsOfExperience: z.number().int().min(0).optional(),
			summary: z.string().optional(),
			skills: z.array(z.string()).optional(),
		})
		.optional(),
	workExperience: z
		.array(
			z.object({
				company: z.string(),
				title: z.string(),
				startDate: z.string(),
				endDate: z.string(),
				type: z.enum(WORK_EXPERIENCE_TYPES).optional(),
				platforms: z.array(z.string()).optional(),
				techStack: z.array(z.string()).optional(),
				summary: z.string().optional(),
				highlights: z.array(z.string()).optional(),
			}),
		)
		.optional(),
	education: z
		.array(
			z.object({
				degree: z.string(),
				field: z.string(),
				institution: z.string(),
				gpa: z.string().optional(),
			}),
		)
		.optional(),
	certifications: z
		.array(
			z.object({
				name: z.string(),
				issuer: z.string(),
				issueDate: z.string().optional(),
				expirationDate: z.string().optional(),
				url: z.string().optional(),
			}),
		)
		.optional(),
})

export type TExtractedResume = z.infer<typeof extractedResumeSchema>
