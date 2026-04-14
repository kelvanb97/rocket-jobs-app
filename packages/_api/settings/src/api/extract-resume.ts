import { extractTextFromDocx } from "@rja-integrations/document/extract-text-from-docx"
import { extractTextFromPdf } from "@rja-integrations/document/extract-text-from-pdf"
import { createMessage } from "@rja-integrations/llm/client"
import {
	extractedResumeSchema,
	type TExtractedResume,
} from "#schema/extracted-resume-schema"
import { getLlmConfigForUseCase } from "./get-llm-config-for-use-case"

const SYSTEM_PROMPT = `You are a resume parser. Extract structured profile, work experience, education, and certifications information from the resume text the user provides.

Rules:
- Only include fields you can confidently identify in the text. Leave anything you can't find blank/undefined.
- For seniority, choose the closest match from the allowed enum based on the most recent role's title and years of experience.
- For work experience type, default to "full-time" unless the resume explicitly says otherwise (e.g. "Contractor", "Founder", "Self-employed").
- Preserve dates in their original format (e.g. "Jan 2023", "Mar 2024", "Present").
- For highlights, capture bullet-point achievements as short standalone strings.
- For skills, dedupe and normalize casing (e.g. "TypeScript" not "typescript").
- For certifications, extract the certification name, issuing organization, and any dates or verification URLs if present.
- For education, capture GPA as a string exactly as written (e.g. "3.85", "3.85/4.0", "First Class Honours"). Omit if not present on the resume.
- Do not invent or hallucinate companies, titles, schools, or dates that are not in the resume.`

export async function extractResume(
	fileName: string,
	buffer: Buffer,
): Promise<TExtractedResume> {
	const lower = fileName.toLowerCase()
	let text: string
	if (lower.endsWith(".pdf")) {
		text = await extractTextFromPdf(buffer)
	} else if (lower.endsWith(".docx")) {
		text = await extractTextFromDocx(buffer)
	} else {
		throw new Error(
			`Unsupported file type: ${fileName}. Only .pdf and .docx are supported.`,
		)
	}

	if (!text.trim()) {
		throw new Error(
			"No text could be read from this file. The PDF may be image-only or the DOCX may be empty.",
		)
	}

	const configResult = getLlmConfigForUseCase("resume")
	if (!configResult.ok) throw configResult.error

	return createMessage(configResult.data, {
		system: SYSTEM_PROMPT,
		user: `Resume text:\n\n${text}`,
		maxTokens: 4096,
		schema: extractedResumeSchema,
	})
}
