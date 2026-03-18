export type TUserProfile = {
	name: string
	jobTitle: string
	seniority: "junior" | "mid" | "senior" | "staff" | "principal" | "director"
	skills: string[]
	preferredSkills: string[]
	preferredLocationTypes: ("remote" | "hybrid" | "on-site")[]
	preferredLocations: string[]
	salaryMin: number
	salaryMax: number
	industries: string[]
	dealbreakers: string[]
	notes: string
}

export const USER_PROFILE: TUserProfile = {
	name: "Kelvan Brandt",
	jobTitle: "Senior Full-Stack Software Engineer",
	seniority: "senior",
	skills: [
		"TypeScript",
		"JavaScript",
		"React",
		"Next.js",
		"Node.js",
		"PostgreSQL",
		"Supabase",
		"Tailwind CSS",
		"Radix UI",
		"HTML",
		"CSS",
		"REST APIs",
		"Zod",
		"ESLint",
		"Turborepo",
		"pnpm",
		"Git",
		"AWS",
		"Agile",
	],
	preferredSkills: [
		"TypeScript",
		"React",
		"Next.js",
		"Node.js",
		"PostgreSQL",
		"Tailwind CSS",
	],
	preferredLocationTypes: ["remote"],
	preferredLocations: [],
	salaryMin: 150_000,
	salaryMax: 200_000,
	industries: [],
	dealbreakers: [],
	notes: "",
}
