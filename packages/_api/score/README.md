# @aja-api/score

Score job roles against a candidate profile using Claude. The most complex API package — combines database CRUD with AI-powered scoring.

## Exports

### `./api/*`

- `upsertScore(input)` — insert or update a score
- `deleteScore(id)` — delete by ID
- `getScoreByRole(roleId)` — fetch score for a role (returns `TScore | null`)
- `listScoresByRoles(roleIds)` — batch fetch scores
- `scoreRoleById(roleId)` — end-to-end: fetch role + company, build prompt, call Claude, upsert result
- `scoreRoleData(role, company, options?)` — score from pre-fetched data with optional model override

All return `Promise<TResult<T>>`.

### `./schema/*`

- `TScore` — score entity type (roleId, score 0-100, positive[], negative[])
- `TUpsertScore` — input type for upserting
- `TScoreResponse` — structured AI response (score, isTitleFit, isSkillsAlign, etc.)
- Zod schemas and marshallers

### `./prompt/*`

- `buildScoringPrompt(role, company, profile, weights)` — generates `{ system, user }` strings for the Claude API call

### `./lib/*`

- `scoreRole(model, system, user)` — sends prompt to Claude via `@aja-integrations/anthropic` and parses structured response

## Dependencies

- `@aja-integrations/anthropic` — Claude API wrapper
- `@aja-config/user` — candidate profile and scoring weights
