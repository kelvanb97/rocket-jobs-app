import type { TInteraction } from "@rja-api/interaction/schema/interaction-schema"
import { Button } from "@rja-design/ui/library/button"
import { XStack } from "@rja-design/ui/primitives/x-stack"
import { YStack } from "@rja-design/ui/primitives/y-stack"

function formatDate(date: Date | null): string {
	if (!date) return "—"
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	})
}

interface IInteractionListProps {
	interactions: TInteraction[]
	personNames: Map<number, string>
	onDelete: (id: number) => void
	deletingId: number | null
}

export function InteractionList({
	interactions,
	personNames,
	onDelete,
	deletingId,
}: IInteractionListProps) {
	if (interactions.length === 0) {
		return (
			<p className="text-sm text-muted-foreground py-4 text-center">
				No interactions recorded yet.
			</p>
		)
	}

	return (
		<YStack className="gap-2">
			{interactions.map((interaction) => (
				<XStack
					key={interaction.id}
					className="items-start justify-between rounded-md border px-3 py-2 gap-2"
				>
					<YStack className="gap-0.5 min-w-0 flex-1">
						<XStack className="items-center gap-2">
							<span className="text-xs text-muted-foreground shrink-0">
								{formatDate(interaction.createdAt)}
							</span>
							<span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
								{interaction.type}
							</span>
							<span className="text-xs text-muted-foreground truncate">
								{interaction.personId
									? (personNames.get(interaction.personId) ??
										"—")
									: "—"}
							</span>
						</XStack>
						{interaction.notes && (
							<p className="text-sm text-foreground truncate">
								{interaction.notes}
							</p>
						)}
					</YStack>
					<Button
						variant="ghost"
						size="icon"
						className="shrink-0 h-7 w-7 text-destructive"
						disabled={deletingId === interaction.id}
						onClick={() => onDelete(interaction.id)}
					>
						&#x1F5D1;
					</Button>
				</XStack>
			))}
		</YStack>
	)
}
