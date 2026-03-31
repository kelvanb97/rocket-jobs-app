import { defineConfig } from "drizzle-kit"

export default defineConfig({
	out: "./migrations",
	schema: "./src/schema.ts",
	dialect: "sqlite",
	dbCredentials: {
		url: "../../data/aja.db",
	},
})
