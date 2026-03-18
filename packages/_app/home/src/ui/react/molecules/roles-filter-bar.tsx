import {
	type TLocationType,
	type TRoleSource,
	type TRoleStatus,
} from "@aja-api/role/schema/role-schema"
import { Button } from "@aja-design/ui/library/button"
import { Input } from "@aja-design/ui/library/input"
import { Select } from "@aja-design/ui/library/select"
import { XStack } from "@aja-design/ui/primitives/x-stack"
import { YStack } from "@aja-design/ui/primitives/y-stack"
import { useRef, useState } from "react"

export type TSortOption =
	| "posted_at_desc"
	| "created_at_desc"
	| "score_desc"
	| "score_asc"

export interface IRolesFilters {
	search: string
	status: TRoleStatus | undefined
	locationType: TLocationType | undefined
	source: TRoleSource | undefined
	scoreMin: number | undefined
	scoreMax: number | undefined
	sort: TSortOption
}

const STATUS_CHIPS: Array<{ label: string; value: TRoleStatus | undefined }> = [
	{ label: "All", value: undefined },
	{ label: "Pending", value: "pending" },
	{ label: "Applied", value: "applied" },
	{ label: "Rejected", value: "rejected" },
	{ label: "Won't Do", value: "wont_do" },
]

const LOCATION_TYPE_OPTIONS: { label: string; value: TLocationType }[] = [
	{ label: "Remote", value: "remote" },
	{ label: "Hybrid", value: "hybrid" },
	{ label: "On-site", value: "on-site" },
]

const SOURCE_OPTIONS: { label: string; value: TRoleSource }[] = [
	{ label: "Himalayas", value: "himalayas" },
	{ label: "Jobicy", value: "jobicy" },
	{ label: "Remote OK", value: "remoteok" },
	{ label: "We Work Remotely", value: "weworkremotely" },
	{ label: "LinkedIn", value: "linkedin" },
	{ label: "Indeed", value: "indeed" },
	{ label: "Company Website", value: "company-website" },
	{ label: "Referral", value: "referral" },
	{ label: "Recruiter", value: "recruiter" },
	{ label: "Other", value: "other" },
]

const SORT_OPTIONS: { label: string; value: TSortOption }[] = [
	{ label: "Newest Posted", value: "posted_at_desc" },
	{ label: "Newest Added", value: "created_at_desc" },
	{ label: "Highest Score", value: "score_desc" },
	{ label: "Lowest Score", value: "score_asc" },
]

interface IRolesFilterBarProps {
	filters: IRolesFilters
	onFiltersChange: (filters: IRolesFilters) => void
}

export function RolesFilterBar({
	filters,
	onFiltersChange,
}: IRolesFilterBarProps) {
	const [searchValue, setSearchValue] = useState(filters.search)
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const handleSearchChange = (value: string) => {
		setSearchValue(value)
		if (timerRef.current) clearTimeout(timerRef.current)
		timerRef.current = setTimeout(() => {
			onFiltersChange({ ...filters, search: value })
		}, 300)
	}

	const handleScoreChange = (
		field: "scoreMin" | "scoreMax",
		value: string,
	) => {
		const num = value === "" ? undefined : Number(value)
		if (num !== undefined && (isNaN(num) || num < 0 || num > 100)) return
		onFiltersChange({ ...filters, [field]: num })
	}

	return (
		<YStack className="gap-3">
			<XStack className="gap-1">
				{STATUS_CHIPS.map((chip) => (
					<Button
						key={chip.label}
						variant={
							filters.status === chip.value
								? "default"
								: "outline"
						}
						size="sm"
						onClick={() =>
							onFiltersChange({
								...filters,
								status: chip.value,
							})
						}
					>
						{chip.label}
					</Button>
				))}
			</XStack>

			<XStack className="gap-3">
				<Input
					value={searchValue}
					onChange={(e) => handleSearchChange(e.target.value)}
					placeholder="Search roles..."
					className="max-w-xs"
				/>
				<Select
					value={filters.locationType ?? "all"}
					onValueChange={(val) =>
						onFiltersChange({
							...filters,
							locationType:
								val === "all"
									? undefined
									: (val as TLocationType),
						})
					}
					options={LOCATION_TYPE_OPTIONS}
					placeholder="Location type"
				/>
				<Select
					value={filters.source ?? "all"}
					onValueChange={(val) =>
						onFiltersChange({
							...filters,
							source:
								val === "all"
									? undefined
									: (val as TRoleSource),
						})
					}
					options={SOURCE_OPTIONS}
					placeholder="Source"
				/>
				<Input
					type="number"
					min={0}
					max={100}
					value={filters.scoreMin ?? ""}
					onChange={(e) =>
						handleScoreChange("scoreMin", e.target.value)
					}
					placeholder="Min score"
					className="max-w-[100px]"
				/>
				<Input
					type="number"
					min={0}
					max={100}
					value={filters.scoreMax ?? ""}
					onChange={(e) =>
						handleScoreChange("scoreMax", e.target.value)
					}
					placeholder="Max score"
					className="max-w-[100px]"
				/>
				<Select
					value={filters.sort}
					onValueChange={(val) =>
						onFiltersChange({
							...filters,
							sort: val as TSortOption,
						})
					}
					options={SORT_OPTIONS}
					placeholder="Sort by"
				/>
			</XStack>
		</YStack>
	)
}
