"use client"

import {
	Fallback as AvatarPrimitiveFallback,
	Root as AvatarPrimitiveRoot,
} from "@radix-ui/react-avatar"
import { UserIcon } from "#assets/icons/lucide-icons"
import { cn } from "#utils/cn"
import NextImage from "next/image"

const fallbackSizeClasses = {
	"preview-xs": "size-6",
	"preview-sm": "size-6",
	"preview-md": "size-8",
	"preview-lg": "size-12",
	sm: "size-20",
	md: "size-28",
	lg: "size-36",
} as const

const sizeClasses = {
	"preview-xs": "size-10",
	"preview-sm": "size-12",
	"preview-md": "size-16",
	"preview-lg": "size-20",
	sm: "size-36",
	md: "size-48",
	lg: "size-60",
} as const

type AvatarProps = {
	src: string | null | undefined
	alt?: string
	size?: keyof typeof sizeClasses
	className?: string
}

export function Avatar({
	src,
	alt = "",
	size = "preview-md",
	className,
	...props
}: AvatarProps) {
	const sizeClass = sizeClasses[size]
	const fallbackSizeClass = fallbackSizeClasses[size]

	return (
		<AvatarPrimitiveRoot
			data-slot="avatar"
			className={cn(
				"relative flex shrink-0 overflow-hidden rounded-full",
				sizeClass,
				className,
			)}
			{...props}
		>
			{src ? (
				<NextImage src={src} alt={alt} fill className="object-cover" />
			) : null}

			<AvatarPrimitiveFallback
				data-slot="avatar-fallback"
				className={cn(
					"bg-muted flex size-full items-center justify-center rounded-full text-sm font-medium uppercase",
				)}
			>
				<UserIcon
					className={cn("text-muted-foreground", fallbackSizeClass)}
				/>
			</AvatarPrimitiveFallback>
		</AvatarPrimitiveRoot>
	)
}
