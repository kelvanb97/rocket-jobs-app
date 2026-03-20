# @aja-config/user

User-specific configuration for scoring, scraping, and profile data. Acts as the configuration seam — all user preferences live here rather than in the database.

## Exports

### `./experience`

- `TUserProfile` — type defining candidate profile (name, jobTitle, seniority, skills, salary range, location preferences, etc.)
- `USER_PROFILE` — the active user profile constant

### `./scoring`

- `TScoringWeight` — `"high" | "medium" | "low"`
- `TScoringWeights` — weights for titleAndSeniority, skills, salary, location, industry
- `SCORING_WEIGHTS` — the active scoring weights constant

### `./scraper`

- `TSourceName` — union of scraper source names
- `TScraperConfig` — relevant/blocked keywords and enabled sources
- `SCRAPER_CONFIG` — the active scraper configuration
- `GOOGLE_JOBS_SEARCH` — Google Jobs-specific search parameters (titles, remote, freshness, etc.)
