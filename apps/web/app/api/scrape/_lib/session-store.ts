import {
	ScrapeSession,
	type TScrapeSessionSnapshot,
} from "@rja-app/scraper/scrape"
import { NextResponse } from "next/server"

type TScrapeSessionStore = {
	sessions: Map<string, ScrapeSession>
	activeSessionId: string | undefined
}

type TGlobalWithScrapeStore = typeof globalThis & {
	__rjaScrapeSessionStore?: TScrapeSessionStore
}

function getStore(): TScrapeSessionStore {
	const globalWithStore = globalThis as TGlobalWithScrapeStore
	if (!globalWithStore.__rjaScrapeSessionStore) {
		globalWithStore.__rjaScrapeSessionStore = {
			sessions: new Map(),
			activeSessionId: undefined,
		}
	}
	return globalWithStore.__rjaScrapeSessionStore
}

export function getSession(sessionId: string): ScrapeSession | undefined {
	return getStore().sessions.get(sessionId)
}

export function getOrCreateActiveSession(): ScrapeSession {
	const store = getStore()
	const activeSession = store.activeSessionId
		? store.sessions.get(store.activeSessionId)
		: undefined

	if (activeSession) {
		const status = activeSession.getSnapshot().status
		if (status === "running" || status === "handoff_required") {
			return activeSession
		}
		store.activeSessionId = undefined
	}

	const session = new ScrapeSession()
	store.sessions.set(session.id, session)
	store.activeSessionId = session.id

	void session.waitForCompletion().finally(() => {
		if (store.activeSessionId === session.id) {
			store.activeSessionId = undefined
		}
	})

	return session
}

export function serializeSessionSnapshot(
	snapshot: TScrapeSessionSnapshot,
): Record<string, unknown> {
	return {
		id: snapshot.id,
		status: snapshot.status,
		summary: snapshot.summary,
		needsAuth: snapshot.needsAuth,
		handoff: snapshot.handoff,
		error: snapshot.error,
	}
}

export function startResponseFromSnapshot(snapshot: TScrapeSessionSnapshot) {
	if (snapshot.status === "auth_required") {
		return NextResponse.json(
			{
				error: "auth_required",
				sessionId: snapshot.id,
				needsAuth: snapshot.needsAuth ?? [],
			},
			{ status: 401 },
		)
	}

	if (snapshot.status === "handoff_required" && snapshot.handoff) {
		return NextResponse.json(
			{
				error: "handoff_required",
				handoff: {
					sessionId: snapshot.id,
					...snapshot.handoff,
				},
			},
			{ status: 409 },
		)
	}

	if (snapshot.status === "failed") {
		return NextResponse.json(
			{
				error: snapshot.error ?? "Scrape failed.",
				sessionId: snapshot.id,
			},
			{ status: 500 },
		)
	}

	if (snapshot.status === "aborted") {
		return NextResponse.json(
			{
				error: "aborted",
				sessionId: snapshot.id,
				message: snapshot.error ?? "Scrape aborted.",
			},
			{ status: 409 },
		)
	}

	return NextResponse.json({
		data: snapshot.summary,
		sessionId: snapshot.id,
	})
}
