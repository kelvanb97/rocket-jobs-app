import { resolve } from "node:path"
import type { NextConfig } from "next"

process.loadEnvFile(resolve(import.meta.dirname, "../../.env"))

const nextConfig: NextConfig = {
	// NOTE: This is required to support PostHog trailing slash API requests
	skipTrailingSlashRedirect: true,
	transpilePackages: ["@rja-design/ui", "@rja-app/scraper", "@rja-app/score"],
	serverExternalPackages: [
		"patchright",
		"patchright-core",
		"better-sqlite3",
		"@rja-core/drizzle",
	],
}

export default nextConfig
