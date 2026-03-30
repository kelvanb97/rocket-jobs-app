export type TTopRoleResult = {
	id: number
	title: string
	companyId: number | null
	companyName: string
	score: number
	url: string | null
	description: string | null
	location: string | null
	locationType: string | null
	salaryMin: number | null
	salaryMax: number | null
}

export type TCreateDraftResult = {
	applicationId: number
	resumePath: string | null
	coverLetterPath: string | null
}

export type TGenerateDocumentsResult = {
	resumePath: string
	coverLetterPath: string
}

export type TDownloadDocumentsResult = {
	resumeLocal: string
	coverLetterLocal: string
}
