import type { Metadata } from "next"
import "@rja-design/ui/global.css"
import { Providers } from "../ui/react/providers"

export const metadata: Metadata = {
	title: "rocket-jobs-app",
	description: "Dashboard for managing role opportunities",
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon.ico",
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		// TODO: fix hydration warning
		<html lang="en" suppressHydrationWarning>
			<body className="antialiased">
				<Providers>{children}</Providers>
			</body>
		</html>
	)
}
