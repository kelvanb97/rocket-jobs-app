---
name: abstraction
description: >
    Enforce codebase abstraction patterns when writing or modifying code involving
    Supabase, database access, API functions, CRUD operations, entity types, schemas,
    marshallers, SDK wrappers, utility functions, new packages, or new types.
    TRIGGER when: creating or modifying code that touches Supabase, database queries,
    entity CRUD, new utility functions, new types/schemas, SDK integrations, or
    package structure decisions.
    DO NOT TRIGGER when: purely UI component changes, styling, documentation edits,
    config file tweaks, or conversation-only questions with no code output.
user-invocable: false
model: opus
paths: ["packages/_api/**", "packages/_core/**", "packages/_app/**", "packages/_integrations/**"]
---

# Abstraction Enforcement

Before writing any code that involves data access, new types, new utilities, or SDK
interactions, follow every section below. Violations create tech debt that compounds
quickly in this monorepo.

---

## 1. Package Hierarchy

| Layer                     | Scope                 | Belongs here                                          |
| ------------------------- | --------------------- | ----------------------------------------------------- |
| `apps/`                   | --                    | Orchestration glue, env config, entry points **only** |
| `packages/_api/`          | `@rja-api/*`          | All Supabase/database CRUD                            |
| `packages/_app/`          | `@rja-app/*`          | React components, server actions (internal only)      |
| `packages/_config/`       | `@rja-config/*`       | User-specific configuration                           |
| `packages/_core/`         | `@rja-core/*`         | Shared utilities, result types, supabase client       |
| `packages/_design/`       | `@rja-design/*`       | Component library (Radix UI + Tailwind)               |
| `packages/_integrations/` | `@rja-integrations/*` | Third-party SDK wrappers                              |

### Dependency arrows (never invert these)

```
apps -> _app -> _api -> _core
                  \      /
                  _design

_api and apps -> _integrations
apps (scraper, score) -> _config
```

---

## 2. Decision Tree: Where Does This Code Belong?

Ask these questions in order:

1. **Does it talk to Supabase or any database?**
   -> `packages/_api/<entity>/src/api/`
   NEVER in `apps/`, `_app/`, or `_core/`.

2. **Does it wrap a third-party SDK (Anthropic, Patchright, etc.)?**
   -> `packages/_integrations/<sdk>/`

3. **Is it a shared utility with no entity affiliation?**
   -> `packages/_core/<module>/`

4. **Is it a React component or server action?**
   -> `packages/_app/<feature>/`
   Server actions stay internal -- app packages do NOT export them.

5. **Is it orchestration that wires packages together?**
   -> `apps/<app>/`

### Anti-pattern: inline database access in apps

```typescript
// BAD -- Supabase access directly in an app or _app package
// apps/web/src/upload.ts
import { supabaseAdminClient } from "@rja-core/supabase/admin"
const supabase = supabaseAdminClient<Database>()
const { data } = await supabase.schema("app").from("file").insert({ ... })
```

This MUST live in a `@rja-api/*` package instead, even for "simple" one-off queries.

---

## 3. Supabase Rules

- **Only `_api` packages** import `supabaseAdminClient` or any Supabase query builder.
- All queries use `.schema("app")` -- tables live in the `app` schema, not `public`.
- The `Database` type comes from `@rja-app/supabase` (the generated types package).
- Row types are extracted as: `Database["app"]["Tables"]["<table>"]["Row" | "Insert" | "Update"]`

---

## 4. API Package Anatomy

Every entity that touches the database gets its own package:

```
packages/_api/<entity>/
  package.json
  tsconfig.json
  eslint.config.js
  src/
    api/
      create-<entity>.ts
      get-<entity>.ts
      list-<entity>s.ts
      update-<entity>.ts
      delete-<entity>.ts
    schema/
      <entity>-schema.ts       # types, const arrays, Zod schemas
      <entity>-marshallers.ts  # unmarshal, marshalCreate, marshalUpdate
```

### package.json exports and imports

```json
{
    "exports": {
        "./api/*": "./src/api/*.ts",
        "./schema/*": "./src/schema/*.ts"
    },
    "imports": {
        "#*": ["./src/*", "./src/*.ts", "./src/*.tsx"],
        "#api*": ["./src/api*", "./src/api*.ts"],
        "#schema*": ["./src/schema*", "./src/schema*.ts"]
    }
}
```

External consumers import via subpath: `import { createRole } from "@rja-api/role/api/create-role"`
Internal imports use `#` aliases: `import { unmarshalRole } from "#schema/role-marshallers"`

### Canonical API function template

```typescript
import type { Database } from "@rja-app/supabase"
import { errFrom, ok, type TResult } from "@rja-core/result"
import { supabaseAdminClient } from "@rja-core/supabase/admin"
import {
    marshalCreateEntity,
    unmarshalEntity,
} from "#schema/entity-marshallers"
import type { TCreateEntity, TEntity } from "#schema/entity-schema"

export async function createEntity(
    input: TCreateEntity,
): Promise<TResult<TEntity>> {
    const supabase = supabaseAdminClient<Database>()

    const { data, error } = await supabase
        .schema("app")
        .from("entity")
        .insert(marshalCreateEntity(input))
        .select()
        .single()

    if (error) return errFrom(`Error creating entity: ${error.message}`)

    return ok(unmarshalEntity(data))
}
```

---

## 5. Type Safety

### The pattern: as-const array -> union type -> Zod enum

Every value with a known finite set MUST use this three-part pattern:

```typescript
// 1. Single source of truth
export const ROLE_SOURCES = [
    "himalayas",
    "jobicy",
    "remoteok",
    "weworkremotely",
] as const

// 2. Derived union type
export type TRoleSource = (typeof ROLE_SOURCES)[number]

// 3. Zod enum for runtime validation
export const roleSourceSchema = z.enum(ROLE_SOURCES)
```

### Anti-pattern: bare string parameters

```typescript
// BAD -- accepts any string, no validation
function uploadFile(bucket: string, path: string) { ... }

// GOOD -- constrained to known values
export const STORAGE_BUCKETS = ["resumes", "cover-letters", "avatars"] as const
export type TStorageBucket = (typeof STORAGE_BUCKETS)[number]
export const storageBucketSchema = z.enum(STORAGE_BUCKETS)

function uploadFile(bucket: TStorageBucket, path: string) { ... }
```

If a parameter could be one of several known strings, it MUST NOT be typed as `string`.

### Entity types

- API-facing types use camelCase: `companyId`, `sourceUrl`, `createdAt`
- Marshalled types (DB rows) use snake_case via `Database["app"]["Tables"]["<table>"]["Row"]`
- Infer input types from Zod schemas: `type TCreateRole = z.infer<typeof createRoleSchema>`

---

## 6. TResult Pattern

All API functions return `Promise<TResult<T>>`. Never throw from API functions.

```typescript
import { err, errFrom, ok, type TResult } from "@rja-core/result"

// Success
return ok(unmarshalledData)

// Error from string
return errFrom(`Error creating entity: ${error.message}`)

// Error from existing Error object
return err(existingError)
```

Callers check the discriminated union:

```typescript
const result = await createRole(input)
if (!result.ok) {
    // result.error is Error
    throw new SafeForClientError(result.error.message)
}
// result.data is TRole
```

---

## 7. Marshallers

Each entity needs three functions in `src/schema/<entity>-marshallers.ts`:

| Function                | Direction                 | Purpose                                      |
| ----------------------- | ------------------------- | -------------------------------------------- |
| `unmarshalX(row)`       | DB row -> API type        | snake_case to camelCase, parse enums via Zod |
| `marshalCreateX(input)` | Create input -> DB insert | camelCase to snake_case, apply defaults      |
| `marshalUpdateX(input)` | Update input -> DB update | Only include fields that were explicitly set |

Marshallers parse enum fields through their Zod schemas (e.g., `roleSourceSchema.parse(m.source)`)
to ensure runtime type safety at the database boundary.

---

## 8. Pre-flight Checklist

Before writing ANY code involving the patterns above, complete these checks:

### Check 1: Search for existing abstractions

Before creating a new function, type, or utility, search the codebase:

- Grep for the entity/concept name across `packages/_api/`, `packages/_core/`
- Check if an API package already exists for this entity
- Look for existing types that cover your use case

### Check 2: Verify placement

- Database access? Must be in `packages/_api/`
- SDK wrapper? Must be in `packages/_integrations/`
- Shared util? Must be in `packages/_core/`
- If you're tempted to put Supabase access in `apps/` -- stop and create an API package

### Check 3: Check for bare string params

Scan your function signatures. Any parameter that accepts one of a known set of values
must use the as-const -> union -> Zod enum pattern, not `string`.

### Check 4: Confirm dependency hierarchy

Your new code must not create an import that inverts the dependency arrows.
An `_api` package must never import from `_app` or `apps/`.
An `_core` package must never import from `_api`, `_app`, or `apps/`.

### Check 5: Follow established file conventions

- API functions: one function per file, named `<verb>-<entity>.ts`
- Schemas: `<entity>-schema.ts` with const arrays, types, and Zod schemas
- Marshallers: `<entity>-marshallers.ts` with unmarshal/marshalCreate/marshalUpdate
- Subpath exports in package.json for `./api/*` and `./schema/*`
- Internal `#` import aliases
