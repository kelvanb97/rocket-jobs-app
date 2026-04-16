---
name: rj-scrape
description: >
    Use when the user says "/rj-scrape", "$rj-scrape", "rj-scrape", "scrape",
    "scrape jobs", or "run scraper" and wants to pull new listings into the
    rocket-jobs-app database. Hits the web app's /api/scrape endpoint and
    auto-detects missing logins: if any source needs auth, opens a
    Patchright-managed browser that closes itself the moment login is
    detected, then re-runs the scrape. No prompts.
user-invocable: true
---

# rj-scrape Skill

Scrape job listings from configured sources and insert them into the database. The scraper uses a persistent Chrome profile and auto-detects missing logins — you don't need to ask the user about login state. The server reads enabled sources from settings, so the skill never has to manage that list.

## Prerequisites

- The web app must be running locally (`pnpm dev`) on the default port (`http://localhost:3000`).
- At least one source must be enabled in Settings (`/settings`).

## Step 1: Run the scrape

```bash
curl -s -w "\n%{http_code}\n" "http://localhost:3000/api/scrape"
```

Run with a 600000ms (10 min) bash timeout — the scrape can take several minutes.

Interpret the response by status code:

- **200** with `{ "data": <summary> }` → go to Step 3.
- **401** with `{ "error": "auth_required", "needsAuth": [{ "name": "...", "displayName": "...", "homepageUrl": "..." }] }` → go to Step 2.
- **409** with `{ "error": "handoff_required", "handoff": { "sessionId": "...", "source": "...", "reasonCode": "...", "message": "...", "currentUrl": "...", "preferredActor": "harness" | "user", "resumeMode": "in_place" } }` → go to Step 2b.
- **500** with `{ "error": "<message>" }` → surface the message and stop. (Covers "no sources enabled" — point the user at `/settings`.)
- Anything else → surface the status + body and stop.

If the curl itself fails with `connection refused`, tell the user to start the dev server with `pnpm dev` and stop.

## Step 2: Run the login CLI for each source that needs auth

For each entry in `needsAuth` from Step 1, tell the user "Opening **<displayName>** for login. The window will close itself once you're signed in." then run with the Bash tool **foreground** with a 600000ms (10 min) timeout:

```bash
pnpm --filter @rja-app/scraper exec node --import=tsx src/cli/login.ts <name>
```

Use the `name` field (e.g. `linkedin`), not the displayName.

Behavior:

- Opens a real Chromium window using the persistent profile, navigates to the source's homepage.
- Polls every 2 seconds for login state. Closes itself automatically when login is detected.
- Also exits cleanly if the user closes the window manually.
- Times out after 10 minutes and exits.

After all login CLI commands have returned, **go back to Step 1 and re-run the scrape** — but only once. If the second attempt also returns 401, surface the error ("login wasn't picked up — sign in fully and invoke the `rj-scrape` skill again") and stop.

## Step 2b: Recover a paused scrape handoff

When `/api/scrape` returns `409 handoff_required`, the scrape session is paused in-place and the browser stays open. Never restart the scrape from scratch at this point.

Read the handoff payload and branch on `preferredActor`:

- **`preferredActor: "harness"`**
    1. Tell the user what happened and ask explicitly whether they want to hand control over so you can resolve it and resume the scrape.
    2. If the user agrees, call:
        ```bash
        curl -s -X POST "http://localhost:3000/api/scrape/<sessionId>/recover"
        ```
    3. If recovery returns another `409 handoff_required`, surface the new message and follow the updated `preferredActor`.
    4. Otherwise poll:
        ```bash
        curl -s "http://localhost:3000/api/scrape/<sessionId>"
        ```
        until the session reaches `completed`, another `handoff_required`, or `failed`.

- **`preferredActor: "user"`**
    1. Tell the user the live browser is waiting on them and explain the issue briefly (CAPTCHA, human verification, etc.).
    2. Ask them to finish the challenge in the browser and confirm when they are done.
    3. Then resume:
        ```bash
        curl -s -X POST "http://localhost:3000/api/scrape/<sessionId>/resume" -H "Content-Type: application/json" -d '{"actor":"user"}'
        ```
    4. Poll `GET /api/scrape/<sessionId>` until the session reaches `completed`, another `handoff_required`, or `failed`.

If the user declines a harness handoff, tell them to resolve the issue in the live browser and then use the user-resume flow above.

## Step 3: Report results

The success summary shape is:

```json
{
  "total": { "found": N, "filtered": N, "inserted": N, "skipped": N, "errors": N },
  "sources": {
    "linkedin": { "found": N, "filtered": N, "inserted": N, "skipped": N }
  }
}
```

Give the user a brief summary:

- Total roles found, inserted, filtered, and skipped.
- Per-source breakdown if there are multiple keys in `summary.sources`.
- Any per-source `error` fields.
