# web

Next.js 16 dashboard (App Router, Turbopack) for browsing scraped roles, managing scores, and running the auto-apply pipeline.

## Setup

LLM providers, API keys, and per-use-case model selection are configured at runtime in the `/settings` UI (stored in SQLite via `@rja-api/settings`), not via environment variables.

## Scripts

| Script | Command      | Purpose                         |
| ------ | ------------ | ------------------------------- |
| Dev    | `pnpm dev`   | Start dev server with Turbopack |
| Build  | `pnpm build` | Production build                |
| Start  | `pnpm start` | Start production server         |

## Routes

| Path          | Screen                                    |
| ------------- | ----------------------------------------- |
| `/`      | Home dashboard                            |
| `/roles`  | Job roles list with filtering and sorting |
| `/create` | Manual role creation                      |

## API Endpoints

| Method | Path                            | Purpose                      |
| ------ | ------------------------------- | ---------------------------- |
| GET    | `/api/apply/top-role`           | Fetch top unapplied role     |
| POST   | `/api/apply/documents/generate` | Generate resume/cover letter |
| GET    | `/api/apply/documents`          | List generated documents     |
| GET    | `/api/apply/documents/download` | Download a document          |
| POST   | `/api/apply/application`        | Create an application record |
| POST   | `/api/apply/submit`             | Submit an application        |
| POST   | `/api/apply/skip`               | Skip a role                  |

## Dependencies

- `@rja-app/home` — dashboard screens
- `@rja-app/apply` — auto-apply workflow
- `@rja-config/user` — user profile
- `@rja-design/ui` — component library
