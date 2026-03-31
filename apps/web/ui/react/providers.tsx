"use client"

import { Toaster, type ToasterTheme } from "@rja-design/ui/library/toast"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

interface IProviderProps {
	children: React.ReactNode
}

export function Providers({ children }: IProviderProps) {
	const { resolvedTheme } = useTheme()

	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme="dark"
			disableTransitionOnChange
			enableColorScheme
		>
			{children}
			<Toaster
				richColors
				position="top-center"
				theme={resolvedTheme as NonNullable<ToasterTheme>}
			/>
		</NextThemesProvider>
	)
}
