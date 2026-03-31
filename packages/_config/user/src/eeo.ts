// ---------------------------------------------------------------------------
// @rja-config/user — eeo.ts
// ---------------------------------------------------------------------------
// EEO (Equal Employment Opportunity) and work authorization configuration.
// Used by the auto-apply skill to fill demographic and work authorization
// fields on job application forms. Values are free-text strings that Claude
// fuzzy-matches against whatever options the ATS presents. Set a field to
// null to select "Decline to self-identify" or equivalent.
// ---------------------------------------------------------------------------

export type TEeoConfig = {
	gender: string | null
	ethnicity: string | null
	veteranStatus: string | null
	disabilityStatus: string | null
	workAuthorization: string | null
	requiresVisaSponsorship: boolean
}

export const EEO_CONFIG: TEeoConfig = {
	gender: "Male",
	ethnicity: "White",
	veteranStatus: "I am not a protected veteran",
	disabilityStatus: "No, I do not have a disability",
	workAuthorization: "US Citizen",
	requiresVisaSponsorship: false,
}
