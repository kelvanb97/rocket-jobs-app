# Supabase

Database configuration, migrations, and local development setup. Not a Node app — uses the Supabase CLI.

---

## Setup

```bash
pnpm --filter supabase start   # start local Supabase
pnpm --filter supabase stop    # stop local Supabase
```

## Scripts

| Script                    | Purpose                                    |
| ------------------------- | ------------------------------------------ |
| `pnpm start`              | Start local Supabase                       |
| `pnpm stop`               | Stop local Supabase                        |
| `pnpm stop:clear`         | Stop and clear local data                  |
| `pnpm db:reset`           | Reset database                             |
| `pnpm apply:migrations:local` | Push migrations to local instance      |
| `pnpm status`             | Check Supabase status                      |

## Local Ports

| Service  | Port  |
| -------- | ----- |
| API      | 54331 |
| Database | 54332 |
| Studio   | 54333 |

## Key Files

| Path                | Purpose                              |
| ------------------- | ------------------------------------ |
| `config.toml`       | Supabase project configuration       |
| `migrations/`       | SQL migration files                  |

## Notes

- All application tables live in the `app` schema (not `public`)
- Storage bucket `applications` configured for PDF/Word uploads (10MB max)
