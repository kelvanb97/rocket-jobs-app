import { VersionOutdatedBanner } from "@rja-app/version/banner"
import type { Metadata } from "next"
import "@rja-design/ui/global.css"
import { Providers } from "../ui/react/providers"

export const metadata: Metadata = {
	title: "Rocket Jobs",
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
				<Providers>
					<VersionOutdatedBanner />
					{children}
				</Providers>
			</body>
		</html>
	)
}
