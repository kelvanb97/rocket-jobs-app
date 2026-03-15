"use client"

import {
	Corner as ScrollAreaPrimitiveCorner,
	Root as ScrollAreaPrimitiveRoot,
	ScrollAreaScrollbar as ScrollAreaPrimitiveScrollAreaScrollbar,
	ScrollAreaThumb as ScrollAreaPrimitiveScrollAreaThumb,
	Viewport as ScrollAreaPrimitiveViewport,
} from "@radix-ui/react-scroll-area"
import { cn } from "#utils/cn"

function ScrollArea({
	className,
	children,
	...props
}: React.ComponentProps<typeof ScrollAreaPrimitiveRoot>) {
	return (
		<ScrollAreaPrimitiveRoot
			data-slot="scroll-area"
			className={cn("relative", className)}
			{...props}
		>
			<ScrollAreaPrimitiveViewport
				data-slot="scroll-area-viewport"
				className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
			>
				{children}
			</ScrollAreaPrimitiveViewport>
			<ScrollBar />
			<ScrollAreaPrimitiveCorner />
		</ScrollAreaPrimitiveRoot>
	)
}

function ScrollBar({
	className,
	orientation = "vertical",
	...props
}: React.ComponentProps<typeof ScrollAreaPrimitiveScrollAreaScrollbar>) {
	return (
		<ScrollAreaPrimitiveScrollAreaScrollbar
			data-slot="scroll-area-scrollbar"
			orientation={orientation}
			className={cn(
				"flex touch-none p-px transition-colors select-none",
				orientation === "vertical" &&
					"h-full w-2.5 border-l border-l-transparent",
				orientation === "horizontal" &&
					"h-2.5 flex-col border-t border-t-transparent",
				className,
			)}
			{...props}
		>
			<ScrollAreaPrimitiveScrollAreaThumb
				data-slot="scroll-area-thumb"
				className="bg-border relative flex-1 rounded-full"
			/>
		</ScrollAreaPrimitiveScrollAreaScrollbar>
	)
}

export { ScrollArea, ScrollBar }
