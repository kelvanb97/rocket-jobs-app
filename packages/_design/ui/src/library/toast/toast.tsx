"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

export { toast } from "sonner"

export function Toaster({ ...props }: ToasterProps) {
	return <Sonner className="toaster group" {...props} />
}

export type ToasterTheme = ToasterProps["theme"]
