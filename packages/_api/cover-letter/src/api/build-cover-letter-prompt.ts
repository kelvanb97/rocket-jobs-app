import type { TCompany } from "@rja-api/company/schema/company-schema"
import type { TRole } from "@rja-api/role/schema/role-schema"
import type { TUserProfile } from "@rja-config/user/experience"

export function buildCoverLetterPrompt(
	role: TRole,
	company: TCompany | null,
	profile: TUserProfile,
): { system: string; user: string } {
	const system = `You are an expert cover letter writer. Write a compelling, personalized cover letter for a job application.

Guidelines:
- Write in first person as the candidate.
- Keep it concise — 3-4 paragraphs, roughly 250-350 words total.
- Opening: Express genuine interest in the specific role and company. Mention something specific about the company if context is available.
- Body (1-2 paragraphs): Connect 2-3 of the candidate's most relevant accomplishments to what the role requires. Use specific metrics and outcomes from their experience. Show why they're a strong fit.
- Closing: Express enthusiasm, mention availability, and include a confident call to action.
- Tone: Professional but warm. Confident without being arrogant. Specific without being exhaustive.
- Do NOT fabricate any experience or accomplishments.
- Do NOT use clichés like "I am writing to express my interest" or "I believe I would be a great fit."
- Start with something engaging that connects the candidate's experience to the company's mission or the role's challenges.
- The signoff field must include the closing phrase AND the candidate's full name on a new line (e.g. "Sincerely,\nKelvan Brandt").`

	const roleDetails = [
		`Title: ${role.title}`,
		company ? `Company: ${company.name}` : null,
		company?.industry ? `Industry: ${company.industry}` : null,
		company?.size ? `Company Size: ${company.size}` : null,
		company?.website ? `Website: ${company.website}` : null,
		role.locationType ? `Location Type: ${role.locationType}` : null,
		role.description
			? `Description:\n${role.description.slice(0, 4000)}`
			: null,
	]
		.filter(Boolean)
		.join("\n")

	const experienceSummary = profile.workExperience
		.map((w) => {
			const topHighlights = w.highlights.slice(0, 3).join(" ")
			return `- ${w.company} | ${w.title} (${w.startDate} – ${w.endDate}): ${w.summary} ${topHighlights}`
		})
		.join("\n")

	const user = `## Candidate
Name: ${profile.name}
Title: ${profile.jobTitle}
Years of Experience: ${profile.yearsOfExperience}
Summary: ${profile.summary}

Key Skills: ${profile.preferredSkills.join(", ")}

Work Experience:
${experienceSummary}

Education: ${profile.education.map((e) => `${e.degree} in ${e.field}, ${e.institution}`).join("; ")}

## Target Role
${roleDetails}`

	return { system, user }
}
