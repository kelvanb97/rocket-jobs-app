import type { TCompany } from "@aja-api/company/schema/company-schema"
import type { TRole } from "@aja-api/role/schema/role-schema"
import type { TUserProfile } from "@aja-config/user/experience"
import type { TScoringWeights } from "@aja-config/user/scoring"

function formatSalary(min: number | null, max: number | null): string {
	if (min === null && max === null) return "Not listed"
	const fmt = (n: number) => `$${Math.round(n / 1000)}k`
	if (min !== null && max !== null) return `${fmt(min)} - ${fmt(max)}`
	if (min !== null) return `${fmt(min)}+`
	return `Up to ${fmt(max!)}`
}

function buildCandidateContext(profile: TUserProfile): string {
	const sections: string[] = []

	// Identity + summary
	sections.push(
		`${profile.name} — ${profile.jobTitle} (${profile.seniority}-level, ${profile.yearsOfExperience}+ years)`,
	)
	sections.push(profile.summary)

	// Domain expertise
	if (profile.domainExpertise.length > 0) {
		sections.push(
			`Domain expertise: ${profile.domainExpertise.map((d) => d.split(" — ")[0]).join(", ")}`,
		)
	}

	// Work history (condensed for token efficiency — company, title, duration, summary + top 2 highlights)
	if (profile.workExperience.length > 0) {
		const history = profile.workExperience
			.map((w) => {
				const duration = `${w.startDate} – ${w.endDate}`
				const topHighlights = w.highlights.slice(0, 2).join(" ")
				return `- ${w.company} | ${w.title} (${w.type}, ${duration}): ${w.summary} ${topHighlights}`
			})
			.join("\n")
		sections.push(`Work history:\n${history}`)
	}

	// Skills
	sections.push(`Skills: ${profile.skills.join(", ")}`)
	if (profile.preferredSkills.length > 0) {
		sections.push(`Preferred stack: ${profile.preferredSkills.join(", ")}`)
	}

	// Preferences
	sections.push(
		`Location: ${profile.preferredLocationTypes.join(", ")}${profile.preferredLocations.length > 0 ? ` (${profile.preferredLocations.join(", ")})` : ""}`,
	)
	sections.push(
		`Salary: $${Math.round(profile.salaryMin / 1000)}k – $${Math.round(profile.salaryMax / 1000)}k`,
	)

	if (profile.industries.length > 0) {
		sections.push(`Preferred industries: ${profile.industries.join(", ")}`)
	}
	if (profile.dealbreakers.length > 0) {
		sections.push(`Dealbreakers: ${profile.dealbreakers.join(", ")}`)
	}
	if (profile.notes) {
		sections.push(`Notes: ${profile.notes}`)
	}

	return sections.join("\n\n")
}

export function buildScoringPrompt(
	role: TRole,
	company: TCompany | null,
	profile: TUserProfile,
	weights: TScoringWeights,
): { system: string; user: string } {
	const system = `You are a job match scoring assistant. Score how well a job posting matches a candidate on a 0-100 scale.

Scoring brackets:
- 80-100: Strong match — the candidate should apply. Title, skills, seniority, and preferences align well.
- 60-79: Moderate match — worth considering. Most criteria fit with minor gaps the candidate could bridge.
- 40-59: Weak match — likely not worth applying. Notable misalignment on title, skills, seniority, or preferences.
- 20-39: Poor match — do not apply. Major gaps or misalignment across multiple criteria.
- 0-19: Dealbreaker present or fundamental mismatch.

Scoring weights:
1. Title and seniority alignment: ${weights.titleAndSeniority}
2. Skills overlap (required vs candidate): ${weights.skills}
3. Salary range compatibility: ${weights.salary}
4. Location/remote compatibility: ${weights.location}
5. Industry fit: ${weights.industry}

Important scoring rules:
- Evaluate skills by depth, not just keyword matches. The candidate's work history shows what they've actually built — weigh demonstrated experience over listed buzzwords.
- A missing salary on the posting is neutral, not negative.
- Any dealbreaker match forces the score below 20.
- Roles requiring skills entirely outside the candidate's stack should score below 40 regardless of title fit.
- Roles with adjacent but non-preferred tech (e.g. Vue instead of React) should not be penalized as harshly as completely unrelated tech (e.g. Java, C#).

Respond with ONLY valid JSON:
{
  "score": <number 0-100>,
  "isTitleFit": <boolean>,
  "isSeniorityAppropriate": <boolean>,
  "doSkillsAlign": <boolean>,
  "isLocationAcceptable": <boolean>,
  "isSalaryAcceptable": <boolean>,
  "positive": [<1-4 concise reasons this is a good match>],
  "negative": [<1-4 concise reasons this is a poor match or concerns>]
}`

	const roleDetails = [
		`Title: ${role.title}`,
		company ? `Company: ${company.name}` : null,
		company?.industry ? `Industry: ${company.industry}` : null,
		company?.size ? `Company Size: ${company.size}` : null,
		`Location Type: ${role.locationType ?? "Not specified"}`,
		role.location ? `Location: ${role.location}` : null,
		`Salary: ${formatSalary(role.salaryMin, role.salaryMax)}`,
		role.source ? `Source: ${role.source}` : null,
		role.description
			? `Description:\n${role.description.slice(0, 3000)}`
			: null,
	]
		.filter(Boolean)
		.join("\n")

	const user = `## Candidate Profile
${buildCandidateContext(profile)}

## Job Posting
${roleDetails}`

	return { system, user }
}
