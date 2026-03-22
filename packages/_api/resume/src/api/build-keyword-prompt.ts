import type { TCompany } from "@aja-api/company/schema/company-schema"
import type { TRole } from "@aja-api/role/schema/role-schema"

export function buildKeywordPrompt(
	role: TRole,
	company: TCompany | null,
): { system: string; user: string } {
	const system = `You are an ATS keyword extraction specialist. Your job is to analyze a job description and extract the exact terminology the employer uses.

Extract keywords into these categories:
1. **requiredSkills** — Technical skills, tools, languages, or frameworks explicitly marked as required or listed in a "requirements" section.
2. **preferredSkills** — Technical skills listed as "nice to have", "preferred", or "bonus".
3. **requiredQualifications** — Non-skill requirements like years of experience, degree requirements, clearances, or certifications that are mandatory.
4. **preferredQualifications** — Non-skill qualifications listed as preferred or nice-to-have.
5. **keyPhrases** — Recurring phrases or action verbs the JD emphasizes (e.g., "cross-functional collaboration", "data-driven decisions", "customer-facing").
6. **industryTerms** — Domain-specific vocabulary, acronyms, or jargon (e.g., "CI/CD", "SOC 2", "ETL", "SaaS").

Rules:
- Use the EXACT terminology from the job description. Do not paraphrase or generalize.
- If the JD is vague or short, return fewer items rather than guessing.
- Do not infer skills that are not mentioned.
- Deduplicate across categories — each term appears in only one category.`

	const roleDetails = [
		`Title: ${role.title}`,
		company ? `Company: ${company.name}` : null,
		company?.industry ? `Industry: ${company.industry}` : null,
		role.description
			? `Description:\n${role.description.slice(0, 4000)}`
			: null,
	]
		.filter(Boolean)
		.join("\n")

	const user = `## Job Posting\n${roleDetails}`

	return { system, user }
}
