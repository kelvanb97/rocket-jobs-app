---
name: rj-install
description: >
    Use when the user says "/rj-install", "$rj-install", "rj-install",
    "install rocket jobs", "set up the repo", or otherwise wants help
    installing the rocket-jobs-app from a fresh clone. Verifies Node, pnpm,
    and git prerequisites; runs pnpm install; runs database migrations; and
    smoke-tests the dev server. Cross-platform (macOS, Linux, Windows native).
user-invocable: true
---

# rj-install Skill

Install the rocket-jobs-app from a fresh clone, verify it boots, and hand the user off to the `rj-setup` skill for configuration. Follow the steps in order and **stop at the first failure** — don't try to recover automatically.

## Assumptions

- The user is running this skill from inside a clone of `rocket-jobs-app`. If they aren't, Step 0 will catch it.
- The user is on macOS, Linux, or Windows. If they're on something else, surface the issue and stop.
- No secrets are needed in `.env` — Anthropic / OpenAI API keys live in the SQLite `llm_config` table and are configured in the GUI by the `rj-setup` skill later. **Do not touch `.env`.**

## Step 0: Confirm we're in a rocket-jobs-app clone

Read the current directory's `package.json` and confirm `"name": "rocket-jobs-app"`. If it doesn't exist or has a different name, stop and tell the user:

> "I don't see a rocket-jobs-app `package.json` here. Clone the repo first with `git clone <repo-url> rocket-jobs-app && cd rocket-jobs-app`, then invoke the `rj-install` skill again."

## Step 1: Detect OS

Use Bash to detect the platform:

```bash
uname -s 2>/dev/null || ver
```

Branch the rest of the steps on the result:
- `Darwin` → macOS
- `Linux` → Linux
- `MINGW*` / `MSYS*` / `CYGWIN*` / Windows → Windows native
- Anything else → tell the user the platform isn't supported and stop.

## Step 2: Verify prerequisites

Run all three checks and collect the results before reporting:

```bash
node -v
pnpm -v
git --version
```

Required versions:
- **Node**: `>= 24`
- **pnpm**: `>= 10`
- **git**: any recent version

If any are **missing or below the required version**, print a single message listing exactly what's missing and the platform-specific install command, then stop.

**macOS hints:**
```bash
brew install node pnpm git
```
Or: <https://nodejs.org/>, <https://pnpm.io/installation>, <https://git-scm.com/>

**Linux hints (Debian/Ubuntu):**
```bash
sudo apt update && sudo apt install -y nodejs git
curl -fsSL https://get.pnpm.io/install.sh | sh -
```
Fedora/RHEL: `sudo dnf install nodejs git` then the pnpm script above.
Arch: `sudo pacman -S nodejs pnpm git`.

**Windows native hints:**
```powershell
winget install OpenJS.NodeJS pnpm.pnpm Git.Git
```
Note: `better-sqlite3` (a transitive native dependency) needs Visual Studio Build Tools on Windows. If `pnpm install` fails on the native build step in Step 3, run `npm install -g windows-build-tools` (older Node) or install **Visual Studio Build Tools 2022** with the "Desktop development with C++" workload.

**Do NOT auto-install prereqs.** Don't run `brew`, `apt`, `winget`, or any sudo commands on the user's behalf. Let them do it.

## Step 3: Install dependencies

```bash
pnpm install
```

Run with a 600000ms (10 min) Bash timeout — `better-sqlite3` builds a native module during install, which can take a minute. Surface the output to the user as it runs.

If `pnpm install` fails:
- On Windows, point at the Visual Studio Build Tools note above.
- Otherwise, surface the error and stop.

## Step 4: Run database migrations

```bash
pnpm --filter @rja-app/drizzle migrate
```

Migrations also run automatically when you start `pnpm dev`, but doing them explicitly here surfaces errors before the dev server tries to launch. If this step fails, surface the error and stop.

This step creates `data/rja.db` if it doesn't exist (gitignored).

## Step 5: Smoke-test the dev server

Don't actually leave the dev server running — just verify it can start. Run it in the **background** with a short timeout:

```bash
pnpm dev
```

After starting, poll `http://localhost:3000` once a second for up to 60 seconds:

```bash
for i in $(seq 1 60); do
  curl -sf http://localhost:3000 > /dev/null && echo "OK" && break
  sleep 1
done
```

When you see "OK" (or after 60s), kill the background process. If you never see "OK", surface the dev server's stdout/stderr and stop.

If you can't reliably manage a background process from your harness, **skip this step** and just tell the user:

> "Run `pnpm dev` in a terminal, then open <http://localhost:3000>. If it loads, you're ready to invoke the `rj-setup` skill."

## Step 6: Hand off

Tell the user:

> "Install complete. Next: invoke the `rj-setup` skill to configure your profile, scraper sources, and LLM provider. Or open <http://localhost:3000/settings> directly if you'd rather configure things manually."

Then stop.

## Common failures

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `pnpm: command not found` | pnpm not installed | Step 2 install hints |
| `EBADENGINE Unsupported engine` | Node < 24 | Upgrade Node to >= 24 |
| `gyp ERR! find Python` | Python missing for native build | macOS: `brew install python`; Linux: `sudo apt install python3`; Windows: install Python from python.org |
| `MSBuild.exe not found` (Windows) | Visual Studio Build Tools missing | Install "Desktop development with C++" workload from VS Build Tools 2022 |
| `Error: ENOENT: no such file or directory, open '...drizzle/migrations'` | You're not in the repo root | `cd` to the rocket-jobs-app folder |
| Dev server hangs / never returns 200 | Port 3000 already in use | `lsof -ti :3000 \| xargs kill` then retry |
