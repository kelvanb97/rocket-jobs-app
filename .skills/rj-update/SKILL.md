---
name: rj-update
description: >
    Use when the user says "/rj-update", "$rj-update", "rj-update",
    "update rocket jobs", "pull latest", or when the in-app banner tells
    the user a new version is available. Pulls the latest code from main,
    reinstalls dependencies, and runs any new database migrations so the
    local copy matches the current release. Cross-platform (macOS, Linux,
    Windows native).
user-invocable: true
---

# rj-update Skill

Bring a local clone of `rocket-jobs-app` up to date with `main` in one pass: `git pull`, `pnpm install`, database migrations, then hand the user off to restart the dev server. Follow the steps in order and **stop at the first failure** — don't try to recover automatically.

## Assumptions

- The user is running this skill from inside a clone of `rocket-jobs-app`.
- `rj-install` has already run successfully at least once (Node, pnpm, and git are present).
- **Do not touch `.env`.** All user config lives in the SQLite database and is not affected by updates.

## Step 0: Confirm we're in a rocket-jobs-app clone

Read the current directory's `package.json` and confirm `"name": "rocket-jobs-app"`. If it doesn't exist or has a different name, stop and tell the user:

> "I don't see a rocket-jobs-app `package.json` here. `cd` into your clone and invoke the `rj-update` skill again. If you haven't installed yet, invoke `rj-install` instead."

## Step 1: Check for uncommitted changes

```bash
git status --porcelain
```

If the output is non-empty, stop and tell the user exactly which files are dirty:

> "You have uncommitted changes in: `<files>`. Commit or stash them before updating. Run `git stash` to set them aside, or `git status` to review. Then invoke `rj-update` again."

**Do NOT auto-stash.** Losing a user's work here would be worse than making them pause.

## Step 2: Check the current branch

```bash
git rev-parse --abbrev-ref HEAD
```

If it returns anything other than `main`, warn the user and **ask before continuing**:

> "You're on branch `<branch>` instead of `main`. `rj-update` is designed to fast-forward `main`. Do you want me to switch to `main` first, or stop?"

If they say switch: `git checkout main`. If they say stop, stop.

## Step 3: Warn about the dev server

Ask the user to stop any running `pnpm dev` process before continuing:

> "If `pnpm dev` is running, stop it now (Ctrl+C in that terminal). SQLite locks the database during dev and Next.js won't pick up new migrations cleanly while the server is live. Reply 'ready' when it's stopped — or 'skip' if it wasn't running."

Wait for confirmation before Step 4.

## Step 4: Fetch and fast-forward

```bash
git pull --ff-only
```

`--ff-only` refuses to merge diverged history. If it fails with "Not possible to fast-forward":

> "Your local `main` has diverged from `origin/main`. This skill won't auto-merge. Run `git log origin/main..HEAD` to see your local-only commits, then decide whether to rebase (`git rebase origin/main`) or reset (`git reset --hard origin/main`, which **discards** local commits). Re-invoke `rj-update` once the branch is clean."

If the output says "Already up to date.", surface that and skip to Step 7 — nothing else to do.

## Step 5: Reinstall dependencies

```bash
pnpm install
```

Run with a 600000ms (10 min) Bash timeout — `better-sqlite3` builds a native module and occasionally rebuilds after updates. Surface the output as it runs.

If `pnpm install` fails:
- On Windows, Visual Studio Build Tools 2022 ("Desktop development with C++") must be installed.
- Otherwise, surface the error and stop. The user may need to re-run `rj-install`.

## Step 6: Apply database migrations

```bash
pnpm --filter @rja-app/drizzle migrate
```

If migrations fail, surface the error verbatim and stop. Do not try to roll back or modify the SQLite file. The user's data is in `data/rja.db` — don't touch it.

## Step 7: Hand off

Tell the user:

> "Update complete. Restart `pnpm dev` in your terminal and reload the browser — the update banner should be gone. If it's still there, hard-refresh (Cmd/Ctrl+Shift+R) to clear the cached server render."

Then stop.

## Common failures

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `fatal: not a git repository` | Not inside the clone | `cd` to the rocket-jobs-app folder |
| `error: Your local changes would be overwritten` | Uncommitted changes (Step 1 missed them) | `git stash` or commit, then retry |
| `fatal: Not possible to fast-forward, aborting` | Local commits on `main` | Rebase or reset, per Step 4 |
| `pnpm install` hangs on native build | Missing Python / build toolchain | macOS: `brew install python`; Linux: `sudo apt install build-essential python3`; Windows: VS Build Tools 2022 |
| Migration errors referencing a column that already exists | DB is ahead of code (rare — usually a downgrade) | Back up `data/rja.db` then re-invoke `rj-update` from a fresh clone |
| Banner still visible after restart | Next.js fetch cache | Hard-refresh, or wait up to 1 hour for the GitHub SHA cache to revalidate |
