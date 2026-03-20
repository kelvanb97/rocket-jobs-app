# @aja-api/role

CRUD operations for job roles with advanced filtering and sorting.

## Exports

### `./api/*`

- `createRole(input)` — insert a new role
- `getRole(id)` — fetch by ID
- `listRoles(input)` — paginated list with filters for company, status, location type, source, and score range; sortable by `created_at`, `posted_at`, `title`, `status`, `score`
- `updateRole(input)` — partial update
- `deleteRole(id)` — delete by ID
- `listRoleUrls(urls)` — check which URLs already exist in the database
- `listUnscoredRoles()` — fetch all roles without a score (used by the score app)

All return `Promise<TResult<T>>`.

### `./schema/*`

- `TRole` — role entity type (companyId, title, url, description, source, locationType, location, salaryMin, salaryMax, status, postedAt, notes)
- `TCreateRole`, `TUpdateRole`, `TListRoles` — input types
- `ROLE_SOURCES` — `"himalayas" | "jobicy" | "remoteok" | "weworkremotely" | "google-jobs" | ...`
- `LOCATION_TYPES` — `"remote" | "hybrid" | "on-site"`
- `ROLE_STATUSES` — `"pending" | "applied" | "rejected" | "wont_do"`
- Zod schemas for each operation and enum
- Marshallers: `unmarshalRole`, `marshalCreateRole`, `marshalUpdateRole`
