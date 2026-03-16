"use client"

import type { TCompany } from "@aja-api/company/schema/company-schema"
import type { TRole, TRoleStatus } from "@aja-api/role/schema/role-schema"
import {
	useAction,
	useActionError,
	useIsLoading,
	useToastOnError,
} from "@aja-core/next-safe-action/hooks"
import { YStack } from "@aja-design/ui/primitives/y-stack"
import { listRolesWithCompaniesAction } from "#actions/list-roles-with-companies"
import { updateRoleStatusAction } from "#actions/update-role-status"
import { RolesFilterBar, type IRolesFilters } from "#molecules/roles-filter-bar"
import { EditRoleDialog } from "#organisms/edit-role-dialog"
import { RolesTable } from "#organisms/roles-table"
import { useCallback, useEffect, useReducer, useRef } from "react"

const PAGE_SIZE = 25

interface IState {
	roles: TRole[]
	companies: Map<string, TCompany>
	filters: IRolesFilters
	page: number
	hasNext: boolean
	selectedRole: TRole | null
	isDialogOpen: boolean
}

type TAction =
	| { type: "SET_FILTERS"; filters: IRolesFilters }
	| {
			type: "LOAD_SUCCESS"
			roles: TRole[]
			companies: TCompany[]
			hasNext: boolean
			page: number
	  }
	| { type: "UPDATE_ROLE"; role: TRole }
	| { type: "OPEN_DIALOG"; role: TRole }
	| { type: "CLOSE_DIALOG" }

function reducer(state: IState, action: TAction): IState {
	switch (action.type) {
		case "SET_FILTERS":
			return {
				...state,
				filters: action.filters,
				roles: [],
				companies: new Map(),
				page: 1,
				hasNext: false,
			}
		case "LOAD_SUCCESS": {
			const newCompanies = new Map(state.companies)
			for (const c of action.companies) {
				newCompanies.set(c.id, c)
			}
			return {
				...state,
				roles:
					action.page === 1
						? action.roles
						: [...state.roles, ...action.roles],
				companies: newCompanies,
				hasNext: action.hasNext,
				page: action.page,
			}
		}
		case "UPDATE_ROLE":
			return {
				...state,
				roles: state.roles.map((r) =>
					r.id === action.role.id ? action.role : r,
				),
			}
		case "OPEN_DIALOG":
			return { ...state, selectedRole: action.role, isDialogOpen: true }
		case "CLOSE_DIALOG":
			return { ...state, selectedRole: null, isDialogOpen: false }
	}
}

const INITIAL_STATE: IState = {
	roles: [],
	companies: new Map(),
	filters: {
		search: "",
		status: undefined,
		locationType: undefined,
		source: undefined,
	},
	page: 1,
	hasNext: false,
	selectedRole: null,
	isDialogOpen: false,
}

export function RolesTemplate() {
	const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
	const sentinelRef = useRef<HTMLDivElement | null>(null)
	const pageRef = useRef(1)
	const filtersRef = useRef(state.filters)
	filtersRef.current = state.filters
	pageRef.current = state.page

	const {
		execute: fetchRoles,
		result: fetchResult,
		status: fetchStatus,
	} = useAction(listRolesWithCompaniesAction, {
		onSuccess: ({ data, input }) => {
			if (data) {
				dispatch({
					type: "LOAD_SUCCESS",
					roles: data.roles,
					companies: data.companies,
					hasNext: data.hasNext,
					page: input.page ?? 1,
				})
			}
		},
	})

	const fetchError = useActionError(fetchResult)
	useToastOnError(fetchError, fetchStatus)
	const isFetching = useIsLoading(fetchStatus)

	const {
		execute: updateStatus,
		result: statusResult,
		status: statusStatus,
	} = useAction(updateRoleStatusAction, {
		onSuccess: ({ data }) => {
			if (data) {
				dispatch({ type: "UPDATE_ROLE", role: data })
				statusUpdatingId.current = null
			}
		},
	})

	const statusError = useActionError(statusResult)
	useToastOnError(statusError, statusStatus)
	const statusUpdatingId = useRef<string | null>(null)

	const doFetch = useCallback(
		(page: number) => {
			const f = filtersRef.current
			fetchRoles({
				page,
				pageSize: PAGE_SIZE,
				search: f.search || undefined,
				status: f.status,
				locationType: f.locationType,
				source: f.source,
				sortBy: "created_at",
				sortOrder: "desc",
			})
		},
		[fetchRoles],
	)

	// Initial load + refetch on filter change
	useEffect(() => {
		doFetch(1)
	}, [state.filters, doFetch])

	// Infinite scroll
	const sentinelCallbackRef = useCallback((node: HTMLDivElement | null) => {
		sentinelRef.current = node
	}, [])

	useEffect(() => {
		const node = sentinelRef.current
		if (!node) return

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0]
				if (entry?.isIntersecting && state.hasNext && !isFetching) {
					doFetch(pageRef.current + 1)
				}
			},
			{ rootMargin: "200px" },
		)

		observer.observe(node)
		return () => observer.disconnect()
	}, [state.hasNext, isFetching, doFetch])

	const handleFiltersChange = (filters: IRolesFilters) => {
		dispatch({ type: "SET_FILTERS", filters })
	}

	const handleStatusChange = (roleId: string, status: TRoleStatus) => {
		statusUpdatingId.current = roleId
		updateStatus({ id: roleId, status })
	}

	const handleRowClick = (role: TRole) => {
		dispatch({ type: "OPEN_DIALOG", role })
	}

	const handleDialogOpenChange = (open: boolean) => {
		if (!open) dispatch({ type: "CLOSE_DIALOG" })
	}

	const handleRoleSaved = (role: TRole) => {
		dispatch({ type: "UPDATE_ROLE", role })
	}

	const companiesNameMap = new Map<string, string>()
	for (const [id, company] of state.companies) {
		companiesNameMap.set(id, company.name)
	}

	const selectedCompany = state.selectedRole?.companyId
		? (state.companies.get(state.selectedRole.companyId) ?? null)
		: null

	return (
		<YStack className="gap-4">
			<RolesFilterBar
				filters={state.filters}
				onFiltersChange={handleFiltersChange}
			/>
			<RolesTable
				roles={state.roles}
				companiesMap={companiesNameMap}
				onStatusChange={handleStatusChange}
				onRowClick={handleRowClick}
				sentinelRef={sentinelCallbackRef}
				isLoadingMore={isFetching}
				statusDisabledId={statusUpdatingId.current}
			/>
			<EditRoleDialog
				open={state.isDialogOpen}
				onOpenChange={handleDialogOpenChange}
				role={state.selectedRole}
				company={selectedCompany}
				onSaved={handleRoleSaved}
			/>
		</YStack>
	)
}
