"use client"

import {
	Indicator as CheckboxPrimitiveIndicator,
	Root as CheckboxPrimitiveRoot,
} from "@radix-ui/react-checkbox"
import { cn } from "#utils/cn"
import { CheckIcon } from "lucide-react"

function Checkbox({
	className,
	...props
}: React.ComponentProps<typeof CheckboxPrimitiveRoot>) {
	return (
		<CheckboxPrimitiveRoot
			data-slot="checkbox"
			className={cn(
				"peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		>
			<CheckboxPrimitiveIndicator
				data-slot="checkbox-indicator"
				className="flex items-center justify-center text-current transition-none"
			>
				<CheckIcon className="size-3.5" />
			</CheckboxPrimitiveIndicator>
		</CheckboxPrimitiveRoot>
	)
}

export { Checkbox }
