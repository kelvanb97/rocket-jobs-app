import { scoreRoleById } from "@rja-api/score/api/score-role-by-id"
import { getScraperConfig } from "@rja-api/settings/api/get-scraper-config"
import type { TSourceName } from "@rja-api/settings/schema/scraper-config-schema"
import {
	closeBrowserContext,
	createBrowserContext,
} from "@rja-integrations/patchright/browser"
import type { BrowserContext } from "@rja-integrations/patchright/page"
import {
	AuthRequiredError,
	ScrapeHandoffRequiredError,
	type TNeedsAuthEntry,
} from "#errors"
import { filterRoles } from "#lib/filter"
import { insertRole } from "#lib/insert"
import * as linkedin from "#sources/linkedin/index"
import { ALL_SOURCES } from "#sources/registry"
import type {
	ScrapedRole,
	TScrapeHandoff,
	TScrapeHandoffActor,
	TSourceHandoff,
	TSourceScrapeOptions,
} from "#types"

export type TScrapeSummary = {
	total: {
		found: number
		filtered: number
		inserted: number
		skipped: number
		scored: number
		scoreErrors: number
		errors: number
	}
	sources: Record<
		string,
		{
			found: number
			filtered: number
			inserted: number
			skipped: number
			scored: number
			scoreErrors: number
			error?: string
		}
	>
}

export type TScrapeOptions = {
	signal?: AbortSignal
}

export type TScrapeSessionStatus =
	| "running"
	| "auth_required"
	| "handoff_required"
	| "completed"
	| "failed"
	| "aborted"

export type TScrapeSessionSnapshot = {
	id: string
	status: TScrapeSessionStatus
	summary: TScrapeSummary
	needsAuth?: TNeedsAuthEntry[]
	handoff?: TScrapeHandoff
	error?: string
}

class Deferred<T> {
	promise: Promise<T>
	resolve!: (value: T | PromiseLike<T>) => void
	reject!: (reason?: unknown) => void

	constructor() {
		this.promise = new Promise<T>((resolve, reject) => {
			this.resolve = resolve
			this.reject = reject
		})
	}
}

function createEmptySummary(): TScrapeSummary {
	return {
		total: {
			found: 0,
			filtered: 0,
			inserted: 0,
			skipped: 0,
			scored: 0,
			scoreErrors: 0,
			errors: 0,
		},
		sources: {},
	}
}

type TPausedHandoff = {
	handoff: TSourceHandoff
	resume: Deferred<void>
}

export class ScrapeSession {
	readonly id = crypto.randomUUID()

	private abortController = new AbortController()
	private context: BrowserContext | null = null
	private summary = createEmptySummary()
	private status: TScrapeSessionStatus = "running"
	private needsAuth: TNeedsAuthEntry[] | undefined
	private handoff: TScrapeHandoff | undefined
	private error: string | undefined
	private pausedHandoff: TPausedHandoff | null = null
	private waiters = new Set<(snapshot: TScrapeSessionSnapshot) => void>()
	private readonly runPromise: Promise<void>

	constructor() {
		this.runPromise = this.run()
	}

	getSnapshot(): TScrapeSessionSnapshot {
		return {
			id: this.id,
			status: this.status,
			summary: this.summary,
			...(this.needsAuth ? { needsAuth: this.needsAuth } : {}),
			...(this.handoff ? { handoff: this.handoff } : {}),
			...(this.error ? { error: this.error } : {}),
		}
	}

	async waitForVisibleState(): Promise<TScrapeSessionSnapshot> {
		if (this.status !== "running") {
			return this.getSnapshot()
		}

		return await new Promise<TScrapeSessionSnapshot>((resolve) => {
			this.waiters.add(resolve)
		})
	}

	async waitForCompletion(): Promise<void> {
		await this.runPromise
	}

	async recover(): Promise<TScrapeSessionSnapshot> {
		if (this.status !== "handoff_required" || !this.pausedHandoff) {
			throw new Error(
				"Scrape session is not waiting on a recoverable handoff.",
			)
		}

		const recoverByHarness = this.pausedHandoff.handoff.recoverByHarness
		if (!recoverByHarness) {
			throw new Error("This handoff must be resolved by the user.")
		}

		try {
			await recoverByHarness()
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err)
			const fallback = {
				...this.pausedHandoff.handoff,
				message: `Automatic recovery failed: ${message}. Resolve it in the live browser, then resume the scrape.`,
				preferredActor: "user" as const,
			}
			this.pausedHandoff = {
				...this.pausedHandoff,
				handoff: fallback,
			}
			this.handoff = fallback
			this.notifyWaiters()
			throw new Error(message)
		}

		this.resumePausedHandoff()
		return this.getSnapshot()
	}

	async resume(
		actor: TScrapeHandoffActor = "user",
	): Promise<TScrapeSessionSnapshot> {
		if (actor === "harness") {
			return await this.recover()
		}

		if (this.status !== "handoff_required" || !this.pausedHandoff) {
			throw new Error(
				"Scrape session is not waiting on user intervention.",
			)
		}

		this.resumePausedHandoff()
		return this.getSnapshot()
	}

	async abort(): Promise<TScrapeSessionSnapshot> {
		if (
			this.status === "completed" ||
			this.status === "failed" ||
			this.status === "aborted"
		) {
			return this.getSnapshot()
		}

		this.abortController.abort()
		this.error = "Scrape aborted."
		this.status = "aborted"
		this.handoff = undefined
		if (this.pausedHandoff) {
			this.pausedHandoff.resume.resolve()
			this.pausedHandoff = null
		}
		this.notifyWaiters()
		await this.runPromise.catch(() => {})
		return this.getSnapshot()
	}

	private notifyWaiters() {
		if (this.waiters.size === 0) return

		const snapshot = this.getSnapshot()
		for (const waiter of this.waiters) {
			waiter(snapshot)
		}
		this.waiters.clear()
	}

	private resumePausedHandoff() {
		if (!this.pausedHandoff) return

		const pending = this.pausedHandoff
		this.pausedHandoff = null
		this.handoff = undefined
		if (!this.abortController.signal.aborted) {
			this.status = "running"
		}
		this.notifyWaiters()
		pending.resume.resolve()
	}

	private async pauseForHandoff(handoff: TSourceHandoff): Promise<void> {
		const resume = new Deferred<void>()
		this.pausedHandoff = { handoff, resume }
		this.handoff = {
			source: handoff.source,
			reasonCode: handoff.reasonCode,
			message: handoff.message,
			currentUrl: handoff.currentUrl,
			preferredActor: handoff.preferredActor,
			resumeMode: handoff.resumeMode,
		}
		this.status = "handoff_required"
		this.notifyWaiters()
		await resume.promise
	}

	private async run(): Promise<void> {
		try {
			const configResult = getScraperConfig()
			if (!configResult.ok) {
				throw new Error(configResult.error.message)
			}
			if (!configResult.data) {
				throw new Error(
					"Scraper config not found. Please configure scraper settings first.",
				)
			}

			const config = configResult.data
			const sources = config.enabledSources as TSourceName[]
			if (sources.length === 0) {
				throw new Error(
					"No sources are enabled. Enable one at /settings before running /scrape.",
				)
			}

			const filterConfig = {
				relevantKeywords: config.relevantKeywords,
				blockedKeywords: config.blockedKeywords,
				blockedCompanies: config.blockedCompanies,
			}

			const companyCache = new Map<string, number>()
			this.summary = createEmptySummary()
			this.context = await createBrowserContext()

			const needsAuth: TNeedsAuthEntry[] = []
			for (const name of sources) {
				const sourceModule = ALL_SOURCES[name]
				if (!sourceModule) continue
				if (!sourceModule.isAuthenticated) continue
				const ok = await sourceModule.isAuthenticated(this.context)
				if (!ok) {
					needsAuth.push({
						name,
						displayName: sourceModule.DISPLAY_NAME,
						homepageUrl: sourceModule.HOMEPAGE_URL,
					})
				}
			}
			if (needsAuth.length > 0) {
				this.needsAuth = needsAuth
				this.status = "auth_required"
				this.notifyWaiters()
				return
			}

			for (const name of sources) {
				if (this.abortController.signal.aborted) break

				if (!ALL_SOURCES[name]) {
					console.warn(`Unknown source "${name}", skipping`)
					continue
				}

				console.log(`[${name}] Starting...`)

				try {
					const sourceSummary = {
						found: 0,
						filtered: 0,
						inserted: 0,
						skipped: 0,
						scored: 0,
						scoreErrors: 0,
					}

					const onRole = async (role: ScrapedRole) => {
						sourceSummary.found++

						const { filtered, removedCount } = filterRoles(
							[role],
							filterConfig,
						)
						if (removedCount > 0) {
							sourceSummary.filtered++
							return
						}

						const result = insertRole(filtered[0]!, companyCache)
						if (result.status !== "inserted") {
							sourceSummary.skipped++
							return
						}

						sourceSummary.inserted++

						const inserted = result.role
						const scoreResult = await scoreRoleById(inserted.id)
						if (scoreResult.ok) {
							sourceSummary.scored++
							console.log(
								`[score] "${inserted.title}" → ${scoreResult.data.score}`,
							)
						} else {
							sourceSummary.scoreErrors++
							console.warn(
								`[score] "${inserted.title}": ${scoreResult.error.message}`,
							)
						}
					}

					const scrapeOptions: TSourceScrapeOptions = {
						onRole,
						onHandoff: async (handoff) => {
							await this.pauseForHandoff(handoff)
						},
						signal: this.abortController.signal,
					}

					await linkedin.scrape(
						this.context,
						{
							urls: config.linkedinUrls,
							maxPages: config.linkedinMaxPages,
							maxPerPage: config.linkedinMaxPerPage,
						},
						scrapeOptions,
					)

					this.summary.sources[name] = sourceSummary
					this.summary.total.found += sourceSummary.found
					this.summary.total.filtered += sourceSummary.filtered
					this.summary.total.inserted += sourceSummary.inserted
					this.summary.total.skipped += sourceSummary.skipped
					this.summary.total.scored += sourceSummary.scored
					this.summary.total.scoreErrors += sourceSummary.scoreErrors

					console.log(
						`[${name}] found=${sourceSummary.found} filtered=${sourceSummary.filtered} inserted=${sourceSummary.inserted} skipped=${sourceSummary.skipped} scored=${sourceSummary.scored} scoreErrors=${sourceSummary.scoreErrors}`,
					)
				} catch (err) {
					if (this.abortController.signal.aborted) break

					const rawMessage =
						err instanceof Error ? err.message : String(err)
					const isBrowserClosed =
						/has been closed|Target closed|Browser closed|Page closed/i.test(
							rawMessage,
						)
					const error = isBrowserClosed
						? "The scraper browser window was closed before the scrape finished. Please leave the browser window open until the scrape is complete."
						: rawMessage
					this.summary.sources[name] = {
						found: 0,
						filtered: 0,
						inserted: 0,
						skipped: 0,
						scored: 0,
						scoreErrors: 0,
						error,
					}
					this.summary.total.errors += 1
					console.error(`[${name}] error: ${rawMessage}`)
				}
			}

			if (this.abortController.signal.aborted) {
				this.status = "aborted"
			} else {
				this.status = "completed"
			}
			this.notifyWaiters()
		} catch (err) {
			if (this.abortController.signal.aborted) {
				this.status = "aborted"
				this.notifyWaiters()
				return
			}

			this.error = err instanceof Error ? err.message : String(err)
			this.status = "failed"
			this.notifyWaiters()
		} finally {
			if (this.context) {
				await closeBrowserContext(this.context).catch(() => {})
				this.context = null
			}

			console.log(
				`[total] found=${this.summary.total.found} filtered=${this.summary.total.filtered} inserted=${this.summary.total.inserted} skipped=${this.summary.total.skipped} scored=${this.summary.total.scored} scoreErrors=${this.summary.total.scoreErrors} errors=${this.summary.total.errors}`,
			)
		}
	}
}

export async function runScraper(
	options: TScrapeOptions = {},
): Promise<TScrapeSummary> {
	const session = new ScrapeSession()
	if (options.signal) {
		options.signal.addEventListener("abort", () => {
			void session.abort()
		})
	}

	const snapshot = await session.waitForVisibleState()
	if (snapshot.status === "auth_required" && snapshot.needsAuth) {
		throw new AuthRequiredError(snapshot.needsAuth)
	}
	if (snapshot.status === "handoff_required" && snapshot.handoff) {
		throw new ScrapeHandoffRequiredError(snapshot.handoff)
	}
	if (snapshot.status === "failed") {
		throw new Error(snapshot.error ?? "Scrape failed.")
	}

	await session.waitForCompletion()
	return session.getSnapshot().summary
}
