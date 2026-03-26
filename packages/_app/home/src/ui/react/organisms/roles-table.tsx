import type { TRole, TRoleStatus } from "@aja-api/role/schema/role-schema"
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from "@aja-design/ui/library/table"
import { TextBody } from "@aja-design/ui/library/text"
import { RolesTableRow } from "#molecules/roles-table-row"

interface IRolesTableProps {
	roles: TRole[]
	companiesMap: Map<string, string>
	scoresMap: Map<string, number>
	onStatusChange: (roleId: string, status: TRoleStatus) => void
	onRowClick: (role: TRole) => void
	sentinelRef: React.RefCallback<HTMLDivElement>
	isLoadingMore: boolean
	statusDisabledId: string | null
}

export function RolesTable({
	roles,
	companiesMap,
	scoresMap,
	onStatusChange,
	onRowClick,
	sentinelRef,
	isLoadingMore,
	statusDisabledId,
}: IRolesTableProps) {
	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Title</TableHead>
						<TableHead>Company</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Location</TableHead>
						<TableHead>Salary</TableHead>
						<TableHead>Score</TableHead>
						<TableHead>Source</TableHead>
						<TableHead>Posted</TableHead>
						<TableHead>Added</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{roles.length === 0 && !isLoadingMore && (
						<TableRow>
							<td
								colSpan={9}
								className="py-8 text-center text-muted-foreground"
							>
								No roles found.
							</td>
						</TableRow>
					)}
					{roles.map((role) => (
						<RolesTableRow
							key={role.id}
							role={role}
							companyName={
								role.companyId
									? (companiesMap.get(role.companyId) ?? null)
									: null
							}
							score={scoresMap.get(role.id) ?? null}
							onStatusChange={onStatusChange}
							onClick={() => onRowClick(role)}
							statusDisabled={role.id === statusDisabledId}
						/>
					))}
				</TableBody>
			</Table>
			<div ref={sentinelRef} className="h-1" />
			{isLoadingMore && (
				<TextBody
					size="sm"
					variant="muted-foreground"
					className="text-center py-4"
				>
					Loading more...
				</TextBody>
			)}
		</>
	)
}
