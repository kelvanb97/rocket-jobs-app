# web

Next.js 16 dashboard (App Router, Turbopack) for browsing scraped roles, triggering scrapes/scores, and managing the auto-apply pipeline.

## Setup

Environment variables are loaded from the root `.env` file via `process.loadEnvFile()` in `next.config.ts`. See the root `.env.example` for required and optional variables.

| Variable | Description | Default |
|---|---|---|
| `APPLY_KEYWORD_MODEL` | Model for keyword extraction | `claude-haiku-4-5-20251001` |
| `APPLY_RESUME_MODEL` | Model for resume/cover letter gen | `claude-opus-4-6-20250619` |

## Scripts

| Script | Command | Purpose |
|---|---|---|
| Dev | `pnpm dev` | Start dev server with Turbopack |
| Build | `pnpm build` | Production build |
| Start | `pnpm start` | Start production server |

## Routes

| Path | Screen |
|---|---|
| `/` | Home dashboard |
| `/roles` | Job roles list with filtering and sorting |
| `/people` | Contact management |
| `/follow-ups` | Interaction tracking |
| `/create` | Manual role creation |
| `/operations` | Scraper and scorer controls |

## API Endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/scrape` | Trigger a scrape run |
| POST | `/api/score` | Trigger batch scoring |
| GET | `/api/apply/top-role` | Fetch top unapplied role |
| POST | `/api/apply/documents/generate` | Generate resume/cover letter |
| GET | `/api/apply/documents` | List generated documents |
| GET | `/api/apply/documents/download` | Download a document |
| POST | `/api/apply/application` | Create an application record |
| POST | `/api/apply/submit` | Submit an application |
| POST | `/api/apply/skip` | Skip a role |

## Dependencies

- `@rja-app/home` — dashboard screens
- `@rja-app/apply` — auto-apply workflow
- `@rja-app/score` — batch scoring
- `@rja-app/scraper` — scrape triggering
- `@rja-config/user` — user profile
- `@rja-design/ui` — component library
