export async function register() {
	if (process.env["NEXT_RUNTIME"] === "nodejs") {
		const { dirname, resolve } = await import("node:path")
		const { fileURLToPath } = await import("node:url")
		const { initDb } = await import("@rja-core/drizzle")

		const migrationsFolder = resolve(
			dirname(fileURLToPath(import.meta.url)),
			"../../packages/_app/drizzle/migrations",
		)
		initDb({ migrationsFolder })
	}
}
