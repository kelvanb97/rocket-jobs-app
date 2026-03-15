import { Button } from "#library/button/button"
import { Select } from "#library/select/select"
import { TextBody } from "#library/text/text"
import { XStack } from "#primitives/x-stack"
import { YStack } from "#primitives/y-stack"
import { cn } from "#utils/cn"
import { XIcon } from "lucide-react"
import { useCallback, useMemo } from "react"

interface IMultiSelectProps<T extends string> {
	values: T[]
	onValueChange: (val: T[]) => void
	options: { label: string; value: T }[]
	placeholder?: string
	max?: number
}

export function MultiSelect<T extends string>({
	values,
	onValueChange,
	options,
	placeholder = "Select an option",
	max = 5,
}: IMultiSelectProps<T>) {
	const isAtMax = useMemo(() => values.length >= max, [max, values.length])
	const disabled = useMemo(() => isAtMax, [isAtMax])

	const addValue = useCallback(
		(value: T) => {
			if (disabled) return

			if (value && !values.includes(value)) {
				onValueChange([...values, value])
			}
		},
		[onValueChange, values, disabled],
	)

	const removeValue = useCallback(
		(index: number) => {
			const newValues = [...values]
			newValues.splice(index, 1)
			onValueChange(newValues)
		},
		[onValueChange, values],
	)

	return (
		<YStack className={cn("gap-2")}>
			{values.length ? (
				<XStack className="flex-wrap gap-2">
					{values.map((val, i) => (
						<XStack
							key={val + i}
							className="items-center gap-2 pl-3 pr-1 py-1/2 bg-muted w-fit rounded text-sm"
						>
							<TextBody>{val}</TextBody>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="hover:text-primary"
								onClick={() => removeValue(i)}
							>
								<XIcon />
							</Button>
						</XStack>
					))}
				</XStack>
			) : null}
			<XStack className="relative w-full items-center">
				<Select
					value={null}
					onValueChange={addValue}
					placeholder={placeholder}
					options={options}
					disabled={disabled}
					className="w-full"
				/>
				<TextBody
					size="xs"
					variant={values.length ? "primary" : "muted-foreground"}
					className="absolute right-0 -bottom-5"
				>
					{values.length} / {max}
				</TextBody>
			</XStack>
		</YStack>
	)
}
