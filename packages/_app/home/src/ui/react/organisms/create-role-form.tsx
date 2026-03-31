"use client"

import type {
	TCompanySize,
	TCompanyStage,
} from "@rja-api/company/schema/company-schema"
import type {
	TLocationType,
	TRoleSource,
} from "@rja-api/role/schema/role-schema"
import {
	useAction,
	useActionError,
	useIsLoading,
	useToastOnError,
} from "@rja-core/next-safe-action/hooks"
import { Button } from "@rja-design/ui/library/button"
import { toast } from "@rja-design/ui/library/toast"
import { YStack } from "@rja-design/ui/primitives/y-stack"
import { createRoleWithCompanyAction } from "#actions/create-role-with-company"
import {
	CompanyFieldsCard,
	type ICompanyFieldsValues,
} from "#molecules/company-fields-card"
import {
	RoleFieldsCard,
	type IRoleFieldsValues,
} from "#molecules/role-fields-card"
import { useRouter } from "next/navigation"
import { useState } from "react"

const INITIAL_COMPANY: ICompanyFieldsValues = {
	name: "",
	website: "",
	linkedinUrl: "",
	size: "",
	stage: "",
	industry: "",
	notes: "",
}

const INITIAL_ROLE: IRoleFieldsValues = {
	title: "",
	url: "",
	description: "",
	source: "",
	locationType: "",
	location: "",
	salaryMin: "",
	salaryMax: "",
	notes: "",
}

export function CreateRoleForm() {
	const router = useRouter()
	const [company, setCompany] =
		useState<ICompanyFieldsValues>(INITIAL_COMPANY)
	const [role, setRole] = useState<IRoleFieldsValues>(INITIAL_ROLE)

	const { execute, result, status } = useAction(createRoleWithCompanyAction, {
		onSuccess: () => {
			toast.success("Role created!")
			router.push("/roles")
		},
	})

	const error = useActionError(result)
	useToastOnError(error, status)
	const isLoading = useIsLoading(status)

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		const companyInput = company.name.trim()
			? {
					name: company.name.trim(),
					website: company.website || undefined,
					linkedinUrl: company.linkedinUrl || undefined,
					size: (company.size as TCompanySize) || undefined,
					stage: (company.stage as TCompanyStage) || undefined,
					industry: company.industry || undefined,
					notes: company.notes || undefined,
				}
			: undefined

		execute({
			company: companyInput,
			title: role.title,
			url: role.url || undefined,
			description: role.description || undefined,
			source: (role.source || undefined) as TRoleSource | undefined,
			locationType: (role.locationType || undefined) as
				| TLocationType
				| undefined,
			location: role.location || undefined,
			salaryMin: role.salaryMin ? Number(role.salaryMin) : undefined,
			salaryMax: role.salaryMax ? Number(role.salaryMax) : undefined,
			notes: role.notes || undefined,
		})
	}

	return (
		<form onSubmit={handleSubmit}>
			<YStack className="gap-6">
				<CompanyFieldsCard values={company} onChange={setCompany} />
				<RoleFieldsCard values={role} onChange={setRole} />
				<Button type="submit" disabled={isLoading}>
					{isLoading ? "Creating..." : "Create Role"}
				</Button>
			</YStack>
		</form>
	)
}
