import { existsSync, mkdirSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, resolve } from "node:path"
import type DatabaseType from "better-sqlite3"
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3"

let _db: BetterSQLite3Database | null = null
type TRequire = (id: string) => unknown

const loadDatabase = (): typeof DatabaseType => {
	try {
		const runtimeRequire = eval("require") as TRequire
		return runtimeRequire("better-sqlite3") as typeof DatabaseType
	} catch {
		const runtimeRequire = createRequire(import.meta.url)
		return runtimeRequire("better-sqlite3") as typeof DatabaseType
	}
}

export function initDb(): BetterSQLite3Database {
	if (_db) return _db

	const dbPath = resolve(process.cwd(), "data", "rja.db")
	const dir = dirname(dbPath)

	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true })
	}

	const sqlite = new (loadDatabase())(dbPath)
	sqlite.pragma("foreign_keys = ON")
	sqlite.pragma("journal_mode = WAL")

	_db = drizzle(sqlite)
	return _db
}

export function db(): BetterSQLite3Database {
	return _db ?? initDb()
}
