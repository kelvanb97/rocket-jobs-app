"use client"

import { Root as LabelPrimitiveRoot } from "@radix-ui/react-label"
import { geistSans, TextBody } from "#library/text/text"
import { cn } from "#utils/cn"

interface ILabelProps extends React.ComponentProps<typeof LabelPrimitiveRoot> {
	size?: "xs" | "sm" | "md" | "lg" | "xl"
	showRequiredIcon?: boolean
}

function Label({
	className,
	size = "sm",
	showRequiredIcon,
	...props
}: ILabelProps) {
	const sizeClassName = getSizeClassName(size)

	return (
		<LabelPrimitiveRoot
			data-slot="label"
			className={cn(
				"flex items-center gap-2 leading-none select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
				geistSans.className,
				className,
				sizeClassName,
			)}
			{...props}
		>
			{showRequiredIcon && <RequiredIcon size={size} />}
			{props.children}
		</LabelPrimitiveRoot>
	)
}

function RequiredIcon({ size }: { size: ILabelProps["size"] }) {
	return (
		<TextBody
			className={cn("text-primary", getOneSizeLargerClassName(size))}
		>
			*
		</TextBody>
	)
}

function getOneSizeLargerClassName(size: ILabelProps["size"]) {
	switch (size) {
		case "xs":
			return getSizeClassName("sm")
		case "sm":
			return getSizeClassName("md")
		case "md":
			return getSizeClassName("lg")
		case "lg":
			return getSizeClassName("xl")
		case "xl":
			return getSizeClassName("2xl")
		default:
			return getSizeClassName("md")
	}
}

function getSizeClassName(size: ILabelProps["size"] | "2xl") {
	switch (size) {
		case "xs":
			return "text-xs font-normal"
		case "sm":
			return "text-sm font-medium"
		case "md":
			return "text-md font-normal"
		case "lg":
			return "text-lg font-semibold"
		case "xl":
			return "text-xl font-semibold"
		case "2xl":
			return "text-2xl font-semibold"
		default:
			return "text-sm font-medium"
	}
}

export { Label, RequiredIcon }
