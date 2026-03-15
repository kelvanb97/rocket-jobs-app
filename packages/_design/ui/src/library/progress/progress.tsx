"use client"

import {
	Indicator as ProgressPrimitiveIndicator,
	Root as ProgressPrimitiveRoot,
} from "@radix-ui/react-progress"
import { cn } from "#utils/cn"
import type { ComponentProps } from "react"
import { useMemo } from "react"

interface IProgressProps extends ComponentProps<typeof ProgressPrimitiveRoot> {
	currentValue: number
	maxValue: number
}

function Progress({
	className,
	currentValue,
	maxValue,
	...props
}: IProgressProps) {
	const value = useMemo(
		() => Math.min(Math.max((currentValue / maxValue) * 100, 0), 100),
		[currentValue, maxValue],
	)

	return (
		<ProgressPrimitiveRoot
			data-slot="progress"
			className={cn(
				"bg-input relative h-2 w-full overflow-hidden rounded-full",
				className,
			)}
			{...props}
		>
			<ProgressPrimitiveIndicator
				data-slot="progress-indicator"
				className="bg-[linear-gradient(95deg,var(--color-primary)_0%,var(--color-knockout)_100%)] h-full w-full flex-1 transition-all rounded-full"
				style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
			/>
		</ProgressPrimitiveRoot>
	)
}

export { Progress }
