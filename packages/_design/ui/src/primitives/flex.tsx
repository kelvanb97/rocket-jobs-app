import { cn } from "#utils/cn"
import { forwardRef } from "react"

export const Flex = forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
	return (
		<div ref={ref} className={cn("flex", className)} {...props}>
			{children}
		</div>
	)
})

Flex.displayName = "Flex"
