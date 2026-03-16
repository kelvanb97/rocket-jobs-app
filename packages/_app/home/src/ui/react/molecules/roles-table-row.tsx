import type { TRole, TRoleStatus } from "@aja-api/role/schema/role-schema"
import { TableCell, TableRow } from "@aja-design/ui/library/table"
import { RoleStatusSelect } from "#molecules/role-status-select"

function formatSalary(min: number | null, max: number | null): string {
	if (min === null && max === null) return "—"
	const fmt = (n: number) => `$${Math.round(n / 1000)}k`
	if (min !== null && max !== null) return `${fmt(min)} – ${fmt(max)}`
	if (min !== null) return `${fmt(min)}+`
	return `Up to ${fmt(max!)}`
}

function formatDate(dateStr: string | null): string {
	if (!dateStr) return "—"
	return new Date(dateStr).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	})
}

function formatLocation(
	locationType: string | null,
	location: string | null,
): string {
	if (locationType && location) return `${locationType} · ${location}`
	return locationType ?? location ?? "—"
}

interface IRolesTableRowProps {
	role: TRole
	companyName: string | null
	onStatusChange: (roleId: string, status: TRoleStatus) => void
	onClick: () => void
	statusDisabled?: boolean
}

export function RolesTableRow({
	role,
	companyName,
	onStatusChange,
	onClick,
	statusDisabled = false,
}: IRolesTableRowProps) {
	return (
		<TableRow
			className="cursor-pointer"
			onClick={onClick}
		>
			<TableCell className="font-medium">{role.title}</TableCell>
			<TableCell>{companyName ?? "—"}</TableCell>
			<TableCell>
				<RoleStatusSelect
					value={role.status}
					onValueChange={(status) =>
						onStatusChange(role.id, status)
					}
					disabled={statusDisabled}
				/>
			</TableCell>
			<TableCell>
				{formatLocation(role.locationType, role.location)}
			</TableCell>
			<TableCell>
				{formatSalary(role.salaryMin, role.salaryMax)}
			</TableCell>
			<TableCell>{formatDate(role.createdAt)}</TableCell>
		</TableRow>
	)
}
