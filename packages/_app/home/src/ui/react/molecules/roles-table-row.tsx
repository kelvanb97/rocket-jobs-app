import type { TRole, TRoleStatus } from "@aja-api/role/schema/role-schema"
import { timeAgo } from "@aja-core/dates"
import { Badge } from "@aja-design/ui/library/badge"
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

function scoreColor(score: number): string {
	if (score >= 70) return "text-green-600 dark:text-green-400"
	if (score >= 40) return "text-yellow-600 dark:text-yellow-400"
	return "text-red-600 dark:text-red-400"
}

interface IRolesTableRowProps {
	role: TRole
	companyName: string | null
	score: number | null
	onStatusChange: (roleId: string, status: TRoleStatus) => void
	onClick: () => void
	statusDisabled?: boolean
}

export function RolesTableRow({
	role,
	companyName,
	score,
	onStatusChange,
	onClick,
	statusDisabled = false,
}: IRolesTableRowProps) {
	return (
		<TableRow className="cursor-pointer" onClick={onClick}>
			<TableCell className="font-medium">{role.title}</TableCell>
			<TableCell>{companyName ?? "—"}</TableCell>
			<TableCell>
				<RoleStatusSelect
					value={role.status}
					onValueChange={(status) => onStatusChange(role.id, status)}
					disabled={statusDisabled}
				/>
			</TableCell>
			<TableCell>
				{formatLocation(role.locationType, role.location)}
			</TableCell>
			<TableCell>
				{formatSalary(role.salaryMin, role.salaryMax)}
			</TableCell>
			<TableCell>
				{score !== null ? (
					<span className={`font-medium ${scoreColor(score)}`}>
						{score}
					</span>
				) : (
					<span className="text-muted-foreground">—</span>
				)}
			</TableCell>
			<TableCell>
				{role.source ? (
					<Badge variant="secondary">{role.source}</Badge>
				) : (
					"—"
				)}
			</TableCell>
			<TableCell>
				{role.postedAt ? timeAgo(role.postedAt) : "—"}
			</TableCell>
			<TableCell>{formatDate(role.createdAt)}</TableCell>
		</TableRow>
	)
}
