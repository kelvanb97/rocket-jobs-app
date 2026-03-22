import type { TCompany } from "@aja-api/company/schema/company-schema"
import type { TRole } from "@aja-api/role/schema/role-schema"
import type { TUserProfile } from "@aja-config/user/experience"
import type { TKeywordExtraction } from "#schema/keyword-schema"

function buildFullProfile(profile: TUserProfile): string {
	const sections: string[] = []

	sections.push(
		`Name: ${profile.name}`,
		`Title: ${profile.jobTitle}`,
		`Seniority: ${profile.seniority}`,
		`Years of Experience: ${profile.yearsOfExperience}`,
		`Summary: ${profile.summary}`,
	)

	sections.push(`\nAll Skills: ${profile.skills.join(", ")}`)
	sections.push(`Preferred Skills: ${profile.preferredSkills.join(", ")}`)

	if (profile.domainExpertise.length > 0) {
		sections.push(
			`\nDomain Expertise:\n${profile.domainExpertise.map((d) => `- ${d}`).join("\n")}`,
		)
	}

	if (profile.workExperience.length > 0) {
		const history = profile.workExperience
			.map((w) => {
				const highlights = w.highlights
					.map((h) => `    - ${h}`)
					.join("\n")
				return [
					`  ${w.company} | ${w.title} (${w.type})`,
					`  ${w.startDate} – ${w.endDate}`,
					`  Tech: ${w.techStack.join(", ")}`,
					`  Summary: ${w.summary}`,
					`  Highlights:\n${highlights}`,
				].join("\n")
			})
			.join("\n\n")
		sections.push(`\nWork Experience:\n${history}`)
	}

	if (profile.education.length > 0) {
		const edu = profile.education
			.map((e) => `- ${e.degree} in ${e.field}, ${e.institution}`)
			.join("\n")
		sections.push(`\nEducation:\n${edu}`)
	}

	return sections.join("\n")
}

export function buildResumePrompt(
	role: TRole,
	company: TCompany | null,
	profile: TUserProfile,
	keywords: TKeywordExtraction | null,
): { system: string; user: string } {
	const keywordGuidance = keywords
		? `

You have been provided with keywords extracted from the job description. Use them as follows:
- **Skills**: Prioritize skills matching requiredSkills first, then preferredSkills. Group skills into logical categories (e.g., "Languages", "Frontend", "Cloud & Infrastructure") — you decide the categories based on what fits the role best.
- **Summary**: Address requiredQualifications and weave in industryTerms where they naturally fit. The summary should signal domain familiarity.
- **Highlights**: When rewording highlights, incorporate keyPhrases naturally where the candidate's actual accomplishments support them. Do not force a phrase where it doesn't fit.
- **Industry Terms**: Use industryTerms in the summary and relevant highlights to demonstrate domain fluency.
- If keyword lists are sparse or empty, fall back to general tailoring based on the job description.`
		: ""

	const system = `You are an expert resume writer optimizing for ATS (Applicant Tracking System) compatibility. Your job is to tailor a resume for a specific job application.

You will be given the candidate's complete profile (work history, skills, highlights) and a target job posting. Your task is to produce a tailored resume by:

1. **Summary**: Rewrite the professional summary (2-3 sentences) to emphasize the skills and experience most relevant to this specific role. Do not fabricate experience.
2. **Skills**: Select 15-25 skills from the candidate's skill list that are most relevant to the role. Group them into categories (e.g., "Languages", "Frontend", "Backend & Infrastructure"). Order categories and items within them by relevance to the role. Only include skills the candidate actually has.
3. **Work Experience**: Include ALL work experiences but reorder highlights within each role to lead with the most relevant ones. Select the 3-5 most impactful highlights per role. You may lightly reword highlights to emphasize relevant aspects, but do not fabricate accomplishments.
4. **Education**: Include all education entries as-is.

Important rules:
- Never invent skills, experiences, or accomplishments the candidate doesn't have.
- Keep the professional tone and specificity of the original highlights.
- Quantified results (percentages, metrics) should be preserved exactly.
- The resume should feel naturally tailored, not keyword-stuffed.${keywordGuidance}`

	const roleDetails = [
		`Title: ${role.title}`,
		company ? `Company: ${company.name}` : null,
		company?.industry ? `Industry: ${company.industry}` : null,
		role.locationType ? `Location Type: ${role.locationType}` : null,
		role.location ? `Location: ${role.location}` : null,
		role.description
			? `Description:\n${role.description.slice(0, 4000)}`
			: null,
	]
		.filter(Boolean)
		.join("\n")

	let user = `## Candidate Profile
${buildFullProfile(profile)}

## Target Job Posting
${roleDetails}`

	if (keywords) {
		user += `

## Extracted Keywords
Required Skills: ${keywords.requiredSkills.join(", ") || "None identified"}
Preferred Skills: ${keywords.preferredSkills.join(", ") || "None identified"}
Required Qualifications: ${keywords.requiredQualifications.join(", ") || "None identified"}
Preferred Qualifications: ${keywords.preferredQualifications.join(", ") || "None identified"}
Key Phrases: ${keywords.keyPhrases.join(", ") || "None identified"}
Industry Terms: ${keywords.industryTerms.join(", ") || "None identified"}`
	}

	return { system, user }
}
