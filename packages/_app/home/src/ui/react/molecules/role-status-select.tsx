import { type TRoleStatus } from "@aja-api/role/schema/role-schema"
import { Select } from "@aja-design/ui/library/select"

const STATUS_OPTIONS: { label: string; value: TRoleStatus }[] = [
	{ label: "Pending", value: "pending" },
	{ label: "Applied", value: "applied" },
	{ label: "Rejected", value: "rejected" },
	{ label: "Won't Do", value: "wont_do" },
]

interface IRoleStatusSelectProps {
	value: TRoleStatus
	onValueChange: (status: TRoleStatus) => void
	disabled?: boolean
}

export function RoleStatusSelect({
	value,
	onValueChange,
	disabled = false,
}: IRoleStatusSelectProps) {
	return (
		<div
			onClick={(e) => e.stopPropagation()}
			onKeyDown={(e) => e.stopPropagation()}
		>
			<Select
				value={value || null}
				onValueChange={onValueChange}
				options={STATUS_OPTIONS}
				placeholder="Status"
				disabled={disabled}
				className="min-w-[120px]"
			/>
		</div>
	)
}
