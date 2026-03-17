# @aja-app/scraper

Background service that scrapes job listings from remote job boards and inserts them into the `app.role` table in Supabase.

## Sources

- **Remote OK** — JSON API, filtered by tags (software, react, typescript, etc.)
- **We Work Remotely** — RSS feed, filtered by title keywords
- **Himalayas** — Paginated JSON API (up to 200 jobs per run)
- **Jobicy** — JSON API, queried across multiple tags with dedup

Each source runs independently via `Promise.allSettled` — if one fails, the others still complete.

## Setup

```bash
cp .env.example .env
# Fill in your Supabase credentials
```

## Usage

### One-off scrape

```bash
pnpm scrape
```

Runs all scrapers immediately, logs results, and exits.

### Cron mode

```bash
pnpm start
```

Starts a long-running process that scrapes on a schedule using `node-cron`.

## How the cron works

The cron is **in-process** — `node-cron` is a JavaScript scheduler that runs inside the Node.js process, not a system-level cron job. This means:

- **Your machine must be running** for scrapes to happen. If your laptop is asleep, shut down, or the process is killed, no scrapes will run. There is no catch-up mechanism — missed runs are simply skipped.
- **The process must stay alive.** Running `pnpm start` keeps a Node.js process open. Close the terminal or kill the process and scheduling stops.
- **It does not survive reboots.** You'd need to restart it manually after a reboot, or set it up as a system service (launchd on macOS, systemd on Linux) if you want it to auto-start.

### Schedule format

Set `SCRAPER_CRON_SCHEDULE` in your `.env` file. The format is standard cron:

```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-7, 0 and 7 = Sunday)
│ │ │ │ │
* * * * *
```

Examples:

| Schedule         | Meaning                      |
| ---------------- | ---------------------------- |
| `0 2 * * *`      | 2:00 AM daily (default)      |
| `*/30 * * * *`   | Every 30 minutes             |
| `0 9,18 * * 1-5` | 9 AM and 6 PM, weekdays only |
| `0 */6 * * *`    | Every 6 hours                |

### Practical recommendations

For personal use on a laptop, `pnpm scrape` run manually (or via a macOS shortcut / alias) is the simplest approach. The cron mode is better suited for a machine that stays on — a home server, a cheap VPS, or a container running somewhere.

If you want unattended scheduling on macOS without keeping a terminal open, you can create a launchd plist that runs `pnpm scrape` on a schedule — this uses the OS-level scheduler instead of an in-process one, so it handles sleep/wake more gracefully.

## Deduplication

Roles are deduplicated by URL. Before inserting, the scraper fetches all existing URLs from `app.role` and skips any matches. This means running the scraper multiple times is safe — it only inserts new listings.
