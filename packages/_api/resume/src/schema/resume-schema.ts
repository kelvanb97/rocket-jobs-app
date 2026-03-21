import { z } from "zod"

const resumeWorkExperienceSchema = z.object({
	company: z.string(),
	title: z.string(),
	startDate: z.string(),
	endDate: z.string(),
	highlights: z.array(z.string()),
})

const resumeEducationSchema = z.object({
	degree: z.string(),
	field: z.string(),
	institution: z.string(),
})

export const resumeResponseSchema = z.object({
	summary: z.string(),
	skills: z.array(z.string()),
	workExperience: z.array(resumeWorkExperienceSchema),
	education: z.array(resumeEducationSchema),
})

export type TResumeResponse = z.infer<typeof resumeResponseSchema>
