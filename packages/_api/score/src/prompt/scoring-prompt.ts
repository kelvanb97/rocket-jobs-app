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

export function buildScoringPrompt(
	role: TRole,
	company: TCompany | null,
	profile: TUserProfile,
	weights: TScoringWeights,
): { system: string; user: string } {
	const system = `You are a job match scoring assistant. Given a candidate's profile and a job posting, score how well the job matches the candidate on a scale of 0-100.

Scoring guidelines:
- 90-100: Exceptional match — strong alignment on title, skills, seniority, salary, and location
- 70-89: Good match — most criteria align, minor gaps
- 50-69: Moderate match — some criteria align but notable gaps
- 30-49: Weak match — few criteria align
- 0-29: Poor match — significant misalignment or dealbreakers present

Key factors to weigh:
1. Job title and seniority alignment (${weights.titleAndSeniority} weight)
2. Required skills vs candidate skills (${weights.skills} weight)
3. Salary range overlap (${weights.salary} weight)
4. Location/remote compatibility (${weights.location} weight)
5. Industry fit (${weights.industry} weight)
6. Dealbreakers (any match = score below 20)

Respond with ONLY valid JSON in this exact format:
{
  "score": <number 0-100>,
  "isTitleFit": <boolean — job title aligns with candidate's target role>,
  "isSeniorityAppropriate": <boolean — seniority level matches candidate's level>,
  "doSkillsAlign": <boolean — required skills meaningfully overlap with candidate's skills>,
  "isLocationAcceptable": <boolean — location/remote type is compatible with candidate's preferences>,
  "isSalaryAcceptable": <boolean — salary range overlaps with candidate's range, or salary is not listed>,
  "positive": [<string reasons why this is a good match>],
  "negative": [<string reasons why this is a poor match or concerns>]
}

Keep each reason to one concise sentence. Include 1-4 reasons per category.`

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

	const candidateDetails = [
		`Name: ${profile.name}`,
		`Target Job Title: ${profile.jobTitle}`,
		`Seniority: ${profile.seniority}`,
		`Skills: ${profile.skills.join(", ")}`,
		profile.preferredSkills.length > 0
			? `Preferred Skills: ${profile.preferredSkills.join(", ")}`
			: null,
		`Preferred Location Types: ${profile.preferredLocationTypes.join(", ")}`,
		profile.preferredLocations.length > 0
			? `Preferred Locations: ${profile.preferredLocations.join(", ")}`
			: null,
		`Salary Range: $${Math.round(profile.salaryMin / 1000)}k - $${Math.round(profile.salaryMax / 1000)}k`,
		profile.industries.length > 0
			? `Preferred Industries: ${profile.industries.join(", ")}`
			: null,
		profile.dealbreakers.length > 0
			? `Dealbreakers: ${profile.dealbreakers.join(", ")}`
			: null,
		profile.notes ? `Additional Notes: ${profile.notes}` : null,
	]
		.filter(Boolean)
		.join("\n")

	const user = `## Candidate Profile
${candidateDetails}

## Job Posting
${roleDetails}`

	return { system, user }
}
