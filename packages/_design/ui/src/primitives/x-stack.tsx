import { cn } from "#utils/cn"
import { forwardRef } from "react"

export const XStack = forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
	return (
		<div ref={ref} className={cn("flex flex-row", className)} {...props}>
			{children}
		</div>
	)
})

XStack.displayName = "XStack"
