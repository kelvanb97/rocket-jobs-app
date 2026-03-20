export type TScoringWeight = "high" | "medium" | "low"

export type TScoringWeights = {
	titleAndSeniority: TScoringWeight
	skills: TScoringWeight
	salary: TScoringWeight
	location: TScoringWeight
	industry: TScoringWeight
}

export const SCORING_WEIGHTS: TScoringWeights = {
	titleAndSeniority: "high",
	skills: "high",
	salary: "high",
	location: "medium",
	industry: "low",
}
