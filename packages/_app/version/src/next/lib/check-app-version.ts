import { errFrom, ok } from "@rja-core/result"
import type { TResult } from "@rja-core/result"

const LATEST_COMMIT_URL =
	"https://api.github.com/repos/rocket-jobs-ai/rocket-jobs-app/commits/main"

type NextFetchInit = RequestInit & {
	next?: { revalidate?: number; tags?: string[] }
}

export const getLocalSha = (): string => process.env["LOCAL_COMMIT_SHA"] ?? ""

export const getLocalUpstreamSha = (): string =>
	process.env["LOCAL_UPSTREAM_SHA"] ?? ""

export const getLatestSha = async (): Promise<TResult<string>> => {
	try {
		const init: NextFetchInit = {
			headers: {
				Accept: "application/vnd.github+json",
				"Cache-Control": "no-store",
			},
			next: { revalidate: 3600, tags: ["app-version"] },
		}
		const response = await fetch(LATEST_COMMIT_URL, init)

		if (!response.ok) {
			return errFrom(`GitHub responded ${response.status}`)
		}

		const payload = (await response.json()) as { sha?: unknown }

		if (typeof payload.sha !== "string" || payload.sha.length === 0) {
			return errFrom("GitHub response missing sha")
		}

		return ok(payload.sha)
	} catch (cause) {
		return errFrom(
			cause instanceof Error ? cause.message : "Unknown fetch failure",
		)
	}
}
