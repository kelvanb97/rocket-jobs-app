# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Verification

After making changes, run from the project root:

```bash
pnpm format
pnpm depcheck
pnpm check-types
pnpm lint
pnpm test
```

To run checks for a single package:

```bash
pnpm --filter @aja-api/role check-types
pnpm --filter @aja-api/role lint
```

## Running Apps

```bash
pnpm dev                                          # web app (Turbo)
```

All apps load env from the root `.env` file. See `.env.example` for available variables. Web loads env via `process.loadEnvFile()` in `next.config.ts`.

## Architecture

Turborepo monorepo with pnpm workspaces. Six package layers:

| Layer                     | Scope                 | Purpose                                                 |
| ------------------------- | --------------------- | ------------------------------------------------------- |
| `apps/`                   | —                     | Deployable applications (web)                           |
| `packages/_api/`          | `@aja-api/*`          | Entity CRUD operations against SQLite via Drizzle       |
| `packages/_app/`          | `@aja-app/*`          | Feature modules (React components, server actions)      |
| `packages/_config/`       | `@aja-config/*`       | User-specific configuration (profile, scoring, scraper) |
| `packages/_core/`         | `@aja-core/*`         | Shared utilities and config                             |
| `packages/_design/`       | `@aja-design/*`       | Component library (Radix UI + Tailwind)                 |
| `packages/_integrations/` | `@aja-integrations/*` | Third-party SDK wrappers (Anthropic, Patchright)        |

### Dependency hierarchy

```
apps → _app → _api → _core
                 ↘    ↗
               _design

_api and apps → _integrations
apps → _config
```

API and core packages are **dependencies** (not peerDependencies) in app packages.

### Package exports

API packages export via subpath patterns in package.json:

```json
"exports": {
  "./api/*": "./src/api/*.ts",
  "./schema/*": "./src/schema/*.ts"
}
```

Import like: `import { createRole } from "@aja-api/role/api/create-role"`

Internal imports within a package use `#` aliases defined in the `imports` field of each package's `package.json`:

```json
"imports": {
  "#*": ["./src/*", "./src/*.ts", "./src/*.tsx"]
}
```

### Apps

- **web** — Next.js 16 (App Router, Turbopack). Routes delegate to screens from `@aja-app/home`.

## Key Patterns

### TResult

Database API functions return `TResult<T>` (synchronous). Functions calling external services (Anthropic API) return `Promise<TResult<T>>`. Defined in `@aja-core/result`:

```typescript
type TResult<T, E = Error> =
    | { ok: true; data: T }
    | { ok: false; error: E }
```

Use helpers: `ok(data)`, `err(error)`, `errFrom("message")`

### Server Actions

Located in `packages/_app/*/src/next/actions/`. Pattern:

```typescript
"use server"
export const doThing = actionClient
    .inputSchema(zodSchema)
    .action(async ({ parsedInput }) => {
        const result = apiFunction(parsedInput)
        if (!result.ok) throw new SafeForClientError(result.error.message)
        return result.data
    })
```

App packages should **not** export server actions — they are consumed internally by the app's own components.

### API Layer

Each entity package follows this structure:

```
src/
  api/        # CRUD functions returning TResult
  schema/     # Zod schemas, TypeScript types, constants
```

API functions use `db()` from `@aja-core/drizzle` and table schemas from `@aja-app/drizzle`.

## Database

SQLite database via Drizzle ORM + better-sqlite3. No Docker or external services required.

- Database file: `data/aja.db` (auto-created on first run, gitignored)
- File storage: `data/storage/` (local filesystem, gitignored)
- Schema defined in `packages/_app/drizzle/src/schema.ts`
- Connection factory in `packages/_core/drizzle/src/db.ts`
- Types inferred from Drizzle schema (`$inferSelect` / `$inferInsert`)
- All primary keys are auto-increment integers
- Foreign keys use `PRAGMA foreign_keys = ON` (enabled per connection)
- WAL mode enabled for read concurrency

### Migrations

Migrations run automatically on app startup via `apps/web/instrumentation.ts`. After changing the schema:

```bash
pnpm --filter @aja-app/drizzle generate   # generate a new migration SQL file
```

The next `pnpm dev` applies pending migrations automatically. CLI fallback: `pnpm --filter @aja-app/drizzle migrate`.

## Documentation

When making changes, update any README that is affected by the change. This includes:

- The root `README.md` if the change affects architecture, features, roadmap, or repository structure
- A package's `README.md` if the change modifies that package's API, purpose, or usage

Keep READMEs factual and concise. Do not add speculative content or document things that haven't been built yet.

## Code Style

- Tabs for indentation (not spaces)
- No semicolons, double quotes, trailing commas (`"semi": false, "singleQuote": false`)
- Prettier with `@ianvs/prettier-plugin-sort-imports` handles formatting
- Conventional Commits enforced by commitlint (e.g. `feat:`, `fix:`, `refactor:`)
- Pre-commit hook runs Prettier via lint-staged
- Syncpack enforces `workspace:*` for local deps and exact versions for external deps
