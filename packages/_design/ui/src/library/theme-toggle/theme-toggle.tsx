"use client"

import {
	getLocalStorageItem,
	setLocalStorageItem,
} from "@aja-core/localstorage"
import { Button } from "#library/button/button"
import { cn } from "#utils/cn"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

interface ThemeToggleProps {
	isVerbose?: boolean
}

export function ThemeToggle({ isVerbose }: ThemeToggleProps) {
	const [isDark, setIsDark] = useState(false)

	// Initialize theme from localStorage
	useEffect(() => {
		if (typeof window === "undefined") return
		const stored = getLocalStorageItem("theme")
		const dark =
			stored === "dark" ||
			(!stored &&
				window.matchMedia("(prefers-color-scheme: dark)").matches)
		document.documentElement.classList.toggle("dark", dark)
		setIsDark(dark)
	}, [])

	const toggleTheme = () => {
		const newIsDark = !isDark
		setIsDark(newIsDark)
		document.documentElement.classList.toggle("dark", newIsDark)
		setLocalStorageItem("theme", newIsDark ? "dark" : "light")
	}

	return (
		<Button
			variant="default"
			size={isVerbose ? "auto" : "icon"}
			onClick={toggleTheme}
			className={cn({ "p-2": isVerbose })}
		>
			{isVerbose && `${isDark ? "Light" : "Dark"} mode`}
			{isDark ? (
				<Sun className="h-4 w-4" />
			) : (
				<Moon className="h-4 w-4" />
			)}
		</Button>
	)
}
