import { existsSync, mkdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import Database from "better-sqlite3"
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"

let _db: BetterSQLite3Database | null = null

type InitDbOptions = {
	migrationsFolder?: string
}

export function initDb(options?: InitDbOptions): BetterSQLite3Database {
	if (_db) return _db

	const dbPath = resolve(process.cwd(), "data", "aja.db")
	const dir = dirname(dbPath)

	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true })
	}

	const sqlite = new Database(dbPath)
	sqlite.pragma("foreign_keys = ON")
	sqlite.pragma("journal_mode = WAL")

	_db = drizzle(sqlite)

	if (options?.migrationsFolder) {
		migrate(_db, { migrationsFolder: options.migrationsFolder })
	}

	return _db
}

export function db(): BetterSQLite3Database {
	if (_db) return _db
	return initDb()
}
