import type { TPerson } from "@rja-api/person/schema/person-schema"
import type { TRolePerson } from "@rja-api/role-person/schema/role-person-schema"
import { Button } from "@rja-design/ui/library/button"
import { XStack } from "@rja-design/ui/primitives/x-stack"
import { YStack } from "@rja-design/ui/primitives/y-stack"

interface IRolePersonListProps {
	people: Array<{ rolePerson: TRolePerson; person: TPerson }>
	onUnlink: (personId: number) => void
	unlinkingId: number | null
}

export function RolePersonList({
	people,
	onUnlink,
	unlinkingId,
}: IRolePersonListProps) {
	if (people.length === 0) {
		return (
			<p className="text-sm text-muted-foreground py-4 text-center">
				No people linked to this role yet.
			</p>
		)
	}

	return (
		<YStack className="gap-2">
			{people.map(({ rolePerson, person }) => (
				<XStack
					key={person.id}
					className="items-center justify-between rounded-md border px-3 py-2"
				>
					<YStack className="gap-0.5 min-w-0 flex-1">
						<XStack className="items-center gap-2">
							<span className="text-sm font-medium truncate">
								{person.name}
							</span>
							{rolePerson.relationship && (
								<span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
									{rolePerson.relationship}
								</span>
							)}
						</XStack>
						{(person.title || person.email) && (
							<span className="text-xs text-muted-foreground truncate">
								{[person.title, person.email]
									.filter(Boolean)
									.join(" · ")}
							</span>
						)}
					</YStack>
					<Button
						variant="ghost"
						size="icon"
						className="shrink-0 ml-2 h-7 w-7"
						disabled={unlinkingId === person.id}
						onClick={() => onUnlink(person.id)}
					>
						&#x2715;
					</Button>
				</XStack>
			))}
		</YStack>
	)
}
