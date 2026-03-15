"use client"

import { Button } from "#library/button/button"
import { Input } from "#library/input/input"
import { TextBody } from "#library/text/text"
import { XStack } from "#primitives/x-stack"
import { YStack } from "#primitives/y-stack"
import { cn } from "#utils/cn"
import { PlusIcon, XIcon } from "lucide-react"
import { KeyboardEvent, useCallback, useMemo, useRef, useState } from "react"

type MultiInputProps = {
	id?: string
	placeholder?: string
	values: string[]
	onChange: (values: string[]) => void
	className?: string
	disabled?: boolean
	max?: number
}

export function MultiInput({
	id,
	placeholder = "Type and press Enter",
	values,
	onChange,
	className,
	disabled,
	max = 5,
}: MultiInputProps) {
	const [inputValue, setInputValue] = useState("")
	const inputRef = useRef<HTMLInputElement>(null)

	const isAtMax = useMemo(() => values.length >= max, [max, values.length])

	const handleKeyDown = useCallback(
		(e: KeyboardEvent<HTMLInputElement>) => {
			if (disabled || isAtMax) return

			if (e.key === "Enter") {
				e.preventDefault()
				const newValue = inputValue.trim()
				if (newValue && !values.includes(newValue)) {
					onChange([...values, newValue])
				}
				setInputValue("")
			} else if (e.key === "Backspace" && !inputValue && values.length) {
				onChange(values.slice(0, -1))
			}
		},
		[disabled, inputValue, onChange, values, isAtMax],
	)

	const addValue = useCallback(() => {
		if (disabled || isAtMax) return

		const newValue = inputValue.trim()
		if (newValue && !values.includes(newValue)) {
			onChange([...values, newValue])
		}
		setInputValue("")
	}, [disabled, inputValue, onChange, values, isAtMax])

	const removeValue = useCallback(
		(index: number) => {
			if (disabled) return
			const newValues = [...values]
			newValues.splice(index, 1)
			onChange(newValues)
		},
		[disabled, onChange, values],
	)

	return (
		<YStack
			className={cn(
				"gap-2",
				disabled && "opacity-50 cursor-not-allowed",
				className,
			)}
			onClick={() => inputRef.current?.focus()}
		>
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
				<Input
					ref={inputRef}
					id={id}
					type="text"
					disabled={disabled || isAtMax}
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					className="rounded-r-none"
				/>
				<Button
					type="button"
					variant="secondary"
					onClick={addValue}
					disabled={disabled || !inputValue.trim() || isAtMax}
					className="rounded-l-none border border-l-0"
				>
					<PlusIcon />
				</Button>

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
