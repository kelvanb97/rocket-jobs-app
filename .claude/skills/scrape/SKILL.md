---
name: scrape
description: >
  Scrape job listings from LinkedIn. Runs the scraper CLI and reports results.
  Use when user says "scrape", "scrape jobs", "run scraper", or "/scrape".
user-invocable: true
model: haiku
---

# Scrape Jobs

Scrape job listings from LinkedIn and insert them into the database.

## Prerequisites

- The scraper config must be configured in Settings (keywords, blocked companies, LinkedIn URLs, etc.)

## Step 1: Run the scraper

Run the CLI command using the Bash tool:

```bash
pnpm --filter @rja-app/scraper run scrape linkedin
```

The scraper logs output directly to stdout — found/filtered/inserted/skipped counts, plus a JSON summary at the end.

## Step 2: Report results

After the scraper completes, give the user a brief summary:
- Total roles found, inserted, filtered, and skipped
- Any errors encountered
