import { z } from "zod"

export const keywordExtractionSchema = z.object({
	requiredSkills: z.array(z.string()),
	preferredSkills: z.array(z.string()),
	requiredQualifications: z.array(z.string()),
	preferredQualifications: z.array(z.string()),
	keyPhrases: z.array(z.string()),
	industryTerms: z.array(z.string()),
})

export type TKeywordExtraction = z.infer<typeof keywordExtractionSchema>
