"use client"

import { Button } from "@aja-design/ui/library/button"
import { toast } from "@aja-design/ui/library/toast"
import { YStack } from "@aja-design/ui/primitives/y-stack"
import {
	useAction,
	useActionError,
	useIsLoading,
	useToastOnError,
} from "@aja-core/next-safe-action/hooks"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createRoleWithCompanyAction } from "#actions/create-role-with-company"
import {
	CompanyFieldsCard,
	type ICompanyFieldsValues,
} from "#molecules/company-fields-card"
import {
	type IRoleFieldsValues,
	RoleFieldsCard,
} from "#molecules/role-fields-card"

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
	const [company, setCompany] = useState<ICompanyFieldsValues>(INITIAL_COMPANY)
	const [role, setRole] = useState<IRoleFieldsValues>(INITIAL_ROLE)

	const { execute, result, status } = useAction(
		createRoleWithCompanyAction,
		{
			onSuccess: () => {
				toast.success("Role created!")
				router.push("/roles")
			},
		},
	)

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
					size: company.size || undefined,
					stage: company.stage || undefined,
					industry: company.industry || undefined,
					notes: company.notes || undefined,
				}
			: undefined

		execute({
			company: companyInput,
			title: role.title,
			url: role.url || undefined,
			description: role.description || undefined,
			source: role.source || undefined,
			locationType: role.locationType || undefined,
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
