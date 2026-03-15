import { cn } from "#utils/cn"
import { Geist, Inter } from "next/font/google"

export const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
})

export const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
})

interface IHeaderProps {
	className?: string
	variant?: TVariant
	children: React.ReactNode
}

export function H1({ children, className, variant }: IHeaderProps) {
	return (
		<h1
			className={cn(
				"scroll-m-20 text-6xl font-extrabold tracking-tight",
				geistSans.className,
				className,
				getVariantClassName(variant),
			)}
		>
			{children}
		</h1>
	)
}

export function H2({ children, className, variant }: IHeaderProps) {
	return (
		<h2
			className={cn(
				"scroll-m-20 text-5xl font-semibold tracking-tight",
				geistSans.className,
				className,
				getVariantClassName(variant),
			)}
		>
			{children}
		</h2>
	)
}

export function H3({ children, className, variant }: IHeaderProps) {
	return (
		<h3
			className={cn(
				"scroll-m-20 text-4xl font-semibold tracking-tight",
				geistSans.className,
				className,
				getVariantClassName(variant),
			)}
		>
			{children}
		</h3>
	)
}

export function H4({ children, className, variant }: IHeaderProps) {
	return (
		<h4
			className={cn(
				"scroll-m-20 text-3xl font-semibold tracking-tight",
				geistSans.className,
				className,
				getVariantClassName(variant),
			)}
		>
			{children}
		</h4>
	)
}

export function H5({ children, className, variant }: IHeaderProps) {
	return (
		<h5
			className={cn(
				"scroll-m-20 text-2xl font-normal tracking-tight",
				geistSans.className,
				className,
				getVariantClassName(variant),
			)}
		>
			{children}
		</h5>
	)
}

export function Paragraph({ children, className, variant }: IHeaderProps) {
	return (
		<p
			className={cn(
				"leading-7 [&:not(:first-child)]:mt-6",
				inter.className,
				className,
				getVariantClassName(variant),
			)}
		>
			{children}
		</p>
	)
}

export function BlockQuote({ children, className, variant }: IHeaderProps) {
	return (
		<blockquote
			className={cn(
				"mt-6 border-l-2 pl-6 italic",
				inter.className,
				className,
				getVariantClassName(variant),
			)}
		>
			{children}
		</blockquote>
	)
}

export interface ITextBodyProps {
	children: React.ReactNode
	className?: string
	style?: React.CSSProperties | undefined
	variant?: TVariant
	size?:
		| "2xs"
		| "xs"
		| "sm"
		| "md"
		| "lg"
		| "xl"
		| "2xl"
		| "3xl"
		| "4xl"
		| "5xl"
		| "6xl"
		| "7xl"
		| "8xl"
}

export function TextBody({
	children,
	className,
	style,
	size = "md",
	variant = "primary",
}: ITextBodyProps) {
	const sizeClassName = (() => {
		switch (size) {
			case "2xs":
				return "text-[10px] font-normal"
			case "xs":
				return "text-xs font-normal"
			case "sm":
				return "text-sm font-medium"
			case "md":
				return "text-base font-normal"
			case "lg":
				return "text-lg font-semibold"
			case "xl":
				return "text-xl font-semibold"
			case "2xl":
				return "text-2xl font-semibold"
			case "3xl":
				return "text-3xl font-semibold"
			case "4xl":
				return "text-4xl font-semibold"
			case "5xl":
				return "text-5xl font-semibold"
			case "6xl":
				return "text-6xl font-semibold"
			case "7xl":
				return "text-7xl font-semibold"
			case "8xl":
				return "text-8xl font-semibold"
		}
	})()

	const variantClassName = getVariantClassName(variant)

	return (
		<div
			className={cn(
				variantClassName,
				sizeClassName,
				inter.className,
				className,
			)}
			style={style}
		>
			{children}
		</div>
	)
}

type TVariant =
	| "gradient"
	| "foreground"
	| "primary"
	| "primary-foreground"
	| "secondary"
	| "secondary-foreground"
	| "accent"
	| "accent-foreground"
	| "muted"
	| "muted-foreground"
	| "error"
	| "destructive"
	| "none"

const getVariantClassName = (variant: TVariant = "primary") => {
	switch (variant) {
		case "gradient":
			return "text-gradient bg-clip-text text-transparent bg-[linear-gradient(135deg,var(--color-knockout)_40%,var(--color-primary)_90%)]"
		case "foreground":
			return "text-foreground"
		case "primary":
			return "text-primary"
		case "primary-foreground":
			return "text-primary-foreground"
		case "secondary":
			return "text-secondary"
		case "secondary-foreground":
			return "text-secondary-foreground"
		case "accent":
			return "text-accent"
		case "accent-foreground":
			return "text-accent-foreground"
		case "muted":
			return "text-muted"
		case "muted-foreground":
			return "text-muted-foreground"
		case "error":
			return "text-error"
		case "destructive":
			return "text-destructive"
		case "none":
			return ""
	}
}
