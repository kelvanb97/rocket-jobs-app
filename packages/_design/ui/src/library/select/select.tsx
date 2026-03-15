"use client"

import {
	Content as SelectPrimitiveContent,
	Icon as SelectPrimitiveIcon,
	Item as SelectPrimitiveItem,
	ItemIndicator as SelectPrimitiveItemIndicator,
	ItemText as SelectPrimitiveItemText,
	Portal as SelectPrimitivePortal,
	Root as SelectPrimitiveRoot,
	ScrollDownButton as SelectPrimitiveScrollDownButton,
	ScrollUpButton as SelectPrimitiveScrollUpButton,
	Trigger as SelectPrimitiveTrigger,
	Value as SelectPrimitiveValue,
	Viewport as SelectPrimitiveViewport,
} from "@radix-ui/react-select"
import { cn } from "#utils/cn"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

function SelectBody({
	...props
}: React.ComponentProps<typeof SelectPrimitiveRoot>) {
	return <SelectPrimitiveRoot data-slot="select" {...props} />
}

function SelectValue({
	...props
}: React.ComponentProps<typeof SelectPrimitiveValue>) {
	return <SelectPrimitiveValue data-slot="select-value" {...props} />
}

function SelectTrigger({
	className,
	size = "default",
	children,
	...props
}: React.ComponentProps<typeof SelectPrimitiveTrigger> & {
	size?: "sm" | "default"
}) {
	return (
		<SelectPrimitiveTrigger
			data-slot="select-trigger"
			data-size={size}
			className={cn(
				"border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		>
			{children}
			<SelectPrimitiveIcon asChild>
				<ChevronDownIcon className="size-4 opacity-50" />
			</SelectPrimitiveIcon>
		</SelectPrimitiveTrigger>
	)
}

function SelectContent({
	className,
	children,
	position = "popper",
	...props
}: React.ComponentProps<typeof SelectPrimitiveContent>) {
	return (
		<SelectPrimitivePortal>
			<SelectPrimitiveContent
				data-slot="select-content"
				className={cn(
					"bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
					position === "popper" &&
						"data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
					className,
				)}
				position={position}
				{...props}
			>
				<SelectScrollUpButton />
				<SelectPrimitiveViewport
					className={cn(
						"p-1",
						position === "popper" &&
							"h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1",
					)}
				>
					{children}
				</SelectPrimitiveViewport>
				<SelectScrollDownButton />
			</SelectPrimitiveContent>
		</SelectPrimitivePortal>
	)
}

function SelectItem({
	className,
	children,
	...props
}: React.ComponentProps<typeof SelectPrimitiveItem>) {
	return (
		<SelectPrimitiveItem
			data-slot="select-item"
			className={cn(
				"focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
				className,
			)}
			{...props}
		>
			<span className="absolute right-2 flex size-3.5 items-center justify-center">
				<SelectPrimitiveItemIndicator>
					<CheckIcon className="size-4" />
				</SelectPrimitiveItemIndicator>
			</span>
			<SelectPrimitiveItemText>{children}</SelectPrimitiveItemText>
		</SelectPrimitiveItem>
	)
}

function SelectScrollUpButton({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitiveScrollUpButton>) {
	return (
		<SelectPrimitiveScrollUpButton
			data-slot="select-scroll-up-button"
			className={cn(
				"flex cursor-default items-center justify-center py-1",
				className,
			)}
			{...props}
		>
			<ChevronUpIcon className="size-4" />
		</SelectPrimitiveScrollUpButton>
	)
}

function SelectScrollDownButton({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitiveScrollDownButton>) {
	return (
		<SelectPrimitiveScrollDownButton
			data-slot="select-scroll-down-button"
			className={cn(
				"flex cursor-default items-center justify-center py-1",
				className,
			)}
			{...props}
		>
			<ChevronDownIcon className="size-4" />
		</SelectPrimitiveScrollDownButton>
	)
}

interface ISelectProps<T extends string> {
	value: T | null
	onValueChange: (val: T) => void
	options: { label: string; value: T }[]
	placeholder?: string
	disabled?: boolean
	className?: string
}

export function Select<T extends string>({
	value,
	onValueChange,
	options,
	placeholder = "Select an option",
	disabled = false,
	className = "",
}: ISelectProps<T>) {
	return (
		<SelectBody
			value={value ?? ""}
			onValueChange={onValueChange}
			disabled={disabled}
		>
			<SelectTrigger className={cn("min-w-[200px]", className)}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{options.map((opt) => (
					<SelectItem key={opt.value} value={opt.value}>
						{opt.label}
					</SelectItem>
				))}
			</SelectContent>
		</SelectBody>
	)
}
