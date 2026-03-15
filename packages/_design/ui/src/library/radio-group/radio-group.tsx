"use client"

import {
	Indicator as RadioGroupPrimitiveIndicator,
	Item as RadioGroupPrimitiveItem,
	Root as RadioGroupPrimitiveRoot,
} from "@radix-ui/react-radio-group"
import { cn } from "#utils/cn"
import { CircleIcon } from "lucide-react"

function RadioGroup({
	className,
	...props
}: React.ComponentProps<typeof RadioGroupPrimitiveRoot>) {
	return (
		<RadioGroupPrimitiveRoot
			data-slot="radio-group"
			className={cn("grid gap-3 relative", className)}
			{...props}
		/>
	)
}

function RadioGroupItem({
	className,
	...props
}: React.ComponentProps<typeof RadioGroupPrimitiveItem>) {
	return (
		<RadioGroupPrimitiveItem
			data-slot="radio-group-item"
			className={cn(
				"border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
				className,
			)}
			{...props}
		>
			<RadioGroupPrimitiveIndicator
				data-slot="radio-group-indicator"
				className="relative flex items-center justify-center"
			>
				<CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
			</RadioGroupPrimitiveIndicator>
		</RadioGroupPrimitiveItem>
	)
}

export { RadioGroup, RadioGroupItem }
