# @rja-api/application

CRUD operations for job applications.

## Exports

### `./api/*`

- `createApplication(input)` — insert a new application
- `getApplication(id)` — fetch by ID
- `listApplications(input)` — paginated list with `hasNext`
- `updateApplication(input)` — partial update
- `deleteApplication(id)` — delete by ID

All return `Promise<TResult<T>>`.

### `./schema/*`

- `TApplication` — application entity type (roleId, status, resumePath, coverLetterPath, submittedAt, notes)
- `TCreateApplication`, `TUpdateApplication`, `TListApplications` — input types
- Zod schemas for each operation
- Marshallers: `unmarshalApplication`, `marshalCreateApplication`, `marshalUpdateApplication`
