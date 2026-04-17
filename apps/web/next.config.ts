import { execSync } from "node:child_process"
import type { NextConfig } from "next"

const readLocalCommitSha = (): string => {
	try {
		return execSync("git rev-parse HEAD", {
			stdio: ["ignore", "pipe", "ignore"],
		})
			.toString()
			.trim()
	} catch {
		return ""
	}
}

const nextConfig: NextConfig = {
	// NOTE: This is required to support PostHog trailing slash API requests
	skipTrailingSlashRedirect: true,
	transpilePackages: ["@rja-design/ui"],
	serverExternalPackages: [
		"patchright",
		"patchright-core",
		"better-sqlite3",
		"@rja-core/drizzle",
		"pdf-parse",
	],
	env: {
		LOCAL_COMMIT_SHA: readLocalCommitSha(),
	},
}

export default nextConfig
