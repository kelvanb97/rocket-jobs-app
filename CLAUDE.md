# CLAUDE.md

## Verification

After making changes, run from the project root:

```bash
pnpm format
pnpm depcheck
pnpm check-types
pnpm lint
pnpm test
```

## Architecture

Turborepo monorepo with pnpm workspaces. Four package layers:

| Layer               | Scope           | Purpose                                                  |
| ------------------- | --------------- | -------------------------------------------------------- |
| `apps/`             | —               | Deployable applications (web, scraper, scorer, supabase) |
| `packages/_api/`    | `@aja-api/*`    | Entity CRUD operations against Supabase                  |
| `packages/_app/`    | `@aja-app/*`    | Feature modules (React components, server actions)       |
| `packages/_core/`   | `@aja-core/*`   | Shared utilities and config                              |
| `packages/_design/` | `@aja-design/*` | Component library (Radix UI + Tailwind)                  |

### Dependency hierarchy

```
apps → _app → _api → _core
                 ↘    ↗
               _design
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

Internal imports within a package use `#` aliases: `import { something } from "#lib/util"`

## Key Patterns

### TResult

All API functions return `Promise<TResult<T>>`. Defined in `@aja-core/result`:

```typescript
type TResult<T, E = Error> =
    | { ok: true; data: T }
    | { ok: false; error: E }
```

Use helpers: `ok(data)`, `err(error)`, `errFrom("message")`

### Marshallers

Each API entity has marshallers in `src/schema/{entity}-marshallers.ts` that convert between camelCase (API types) and snake_case (database columns):

- `unmarshalX(row)` — database row → API type
- `marshalCreateX(input)` — create input → database insert
- `marshalUpdateX(input)` — update input → database update

### Server Actions

Located in `packages/_app/*/src/next/actions/`. Pattern:

```typescript
"use server"
export const doThing = actionClient
    .inputSchema(zodSchema)
    .action(async ({ parsedInput }) => {
        const result = await apiFunction(parsedInput)
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
  schema/     # Zod schemas, TypeScript types, marshallers
```

API functions use `supabaseAdminClient<Database>()` from `@aja-core/supabase`.

## Supabase

- All application tables live in the `app` schema (not `public`)
- Local dev URLs: `http://127.0.0.1:54321` (scraper/scorer), `http://127.0.0.1:54331` (web)
- Env vars: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`
- Migrations are in `apps/supabase/migrations/`
