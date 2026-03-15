import { cn } from "#utils/cn"
import React from "react"

interface IHeaderProps {
	className?: string
	variant?: TVariant
	children: React.ReactNode
}

export function H1Vite({ children, className, variant }: IHeaderProps) {
	return (
		<h1
			className={cn(
				"scroll-m-20 text-4xl font-extrabold tracking-tight",
				className,
				getVariantClassName(variant),
			)}
			style={{ fontFamily: "Geist" }}
		>
			{children}
		</h1>
	)
}

export function H2Vite({ children, className, variant }: IHeaderProps) {
	return (
		<h2
			className={cn(
				"scroll-m-20 text-3xl font-semibold tracking-tight",
				className,
				getVariantClassName(variant),
			)}
			style={{ fontFamily: "Geist" }}
		>
			{children}
		</h2>
	)
}

export function H3Vite({ children, className, variant }: IHeaderProps) {
	return (
		<h3
			className={cn(
				"scroll-m-20 text-2xl font-semibold tracking-tight",
				className,
				getVariantClassName(variant),
			)}
			style={{ fontFamily: "Geist" }}
		>
			{children}
		</h3>
	)
}

export function H4Vite({ children, className, variant }: IHeaderProps) {
	return (
		<h4
			className={cn(
				"scroll-m-20 text-xl font-semibold tracking-tight",
				className,
				getVariantClassName(variant),
			)}
			style={{ fontFamily: "Geist" }}
		>
			{children}
		</h4>
	)
}

export function H5Vite({ children, className, variant }: IHeaderProps) {
	return (
		<h5
			className={cn(
				"scroll-m-20 text-lg font-normal tracking-tight",
				className,
				getVariantClassName(variant),
			)}
			style={{ fontFamily: "Geist" }}
		>
			{children}
		</h5>
	)
}

export function ParagraphVite({ children, className, variant }: IHeaderProps) {
	return (
		<p
			className={cn(
				"leading-7 [&:not(:first-child)]:mt-6",
				className,
				getVariantClassName(variant),
			)}
			style={{ fontFamily: "Inter" }}
		>
			{children}
		</p>
	)
}

export function BlockQuoteVite({ children, className, variant }: IHeaderProps) {
	return (
		<blockquote
			className={cn(
				"mt-6 border-l-2 pl-6 italic",
				className,
				getVariantClassName(variant),
			)}
			style={{ fontFamily: "Inter" }}
		>
			{children}
		</blockquote>
	)
}

interface ITextBodyProps {
	children: React.ReactNode
	className?: string
	variant?: TVariant
	size?: "xs" | "sm" | "md" | "lg" | "xl"
}

export function TextBodyVite({
	children,
	className,
	size = "md",
	variant = "primary",
}: ITextBodyProps) {
	const sizeClassName = (() => {
		switch (size) {
			case "xs":
				return "text-xs font-normal"
			case "sm":
				return "text-sm font-normal"
			case "md":
				return "text-base font-normal"
			case "lg":
				return "text-lg font-semibold"
			case "xl":
				return "text-xl font-semibold"
			default:
				return ""
		}
	})()

	const variantClassName = getVariantClassName(variant)

	return (
		<div
			className={cn(variantClassName, sizeClassName, className)}
			style={{ fontFamily: "Inter" }}
		>
			{children}
		</div>
	)
}

type TVariant =
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
		default:
			return ""
	}
}
