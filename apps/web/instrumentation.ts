import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { initDb } from "@aja-core/drizzle"

export function register() {
	const migrationsFolder = resolve(
		dirname(fileURLToPath(import.meta.url)),
		"../../packages/_app/drizzle/migrations",
	)
	initDb({ migrationsFolder })
}
