"use client"

import {
	Arrow as TooltipPrimitiveArrow,
	Content as TooltipPrimitiveContent,
	Portal as TooltipPrimitivePortal,
	Provider as TooltipPrimitiveProvider,
	Root as TooltipPrimitiveRoot,
	Trigger as TooltipPrimitiveTrigger,
} from "@radix-ui/react-tooltip"
import { Paragraph } from "#library/text/text"
import { cn } from "#utils/cn"
import { CircleQuestionMarkIcon } from "lucide-react"
import type { ComponentProps } from "react"

function TooltipProvider({
	delayDuration = 0,
	...props
}: ComponentProps<typeof TooltipPrimitiveProvider>) {
	return (
		<TooltipPrimitiveProvider
			data-slot="tooltip-provider"
			delayDuration={delayDuration}
			{...props}
		/>
	)
}

function TooltipRoot({
	...props
}: ComponentProps<typeof TooltipPrimitiveRoot>) {
	return (
		<TooltipProvider>
			<TooltipPrimitiveRoot data-slot="tooltip" {...props} />
		</TooltipProvider>
	)
}

function TooltipTrigger({
	...props
}: ComponentProps<typeof TooltipPrimitiveTrigger>) {
	return <TooltipPrimitiveTrigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
	className,
	sideOffset = 0,
	children,
	...props
}: ComponentProps<typeof TooltipPrimitiveContent>) {
	return (
		<TooltipPrimitivePortal>
			<TooltipPrimitiveContent
				data-slot="tooltip-content"
				sideOffset={sideOffset}
				className={cn(
					"bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
					className,
				)}
				{...props}
			>
				{children}
				<TooltipPrimitiveArrow className="bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
			</TooltipPrimitiveContent>
		</TooltipPrimitivePortal>
	)
}

interface ITooltipProps {
	iconClassName?: string
	paragraphClassName?: string
	content: string
}

export function Tooltip({
	iconClassName,
	paragraphClassName,
	content,
}: ITooltipProps) {
	return (
		<TooltipRoot>
			<TooltipTrigger asChild>
				<CircleQuestionMarkIcon className={iconClassName} />
			</TooltipTrigger>
			<TooltipContent className="flex max-w-xs flex-col items-start gap-1">
				<Paragraph
					className={cn(
						"inline-block text-wrap leading-snug",
						paragraphClassName,
					)}
				>
					{content}
				</Paragraph>
			</TooltipContent>
		</TooltipRoot>
	)
}
