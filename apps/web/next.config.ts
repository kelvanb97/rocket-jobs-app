import { resolve } from "node:path"
import type { NextConfig } from "next"

try {
	process.loadEnvFile(resolve(import.meta.dirname, "../../.env"))
} catch (e) {
	// Root .env file not found, skipping (expected in Docker build/CI)
}

const nextConfig: NextConfig = {
	// NOTE: This is required to support PostHog trailing slash API requests
	skipTrailingSlashRedirect: true,
	output: "standalone",
	transpilePackages: ["@aja-design/ui", "@aja-app/scraper", "@aja-app/score"],
	serverExternalPackages: ["patchright", "patchright-core"],
}

export default nextConfig
