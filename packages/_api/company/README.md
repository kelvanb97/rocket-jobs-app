# @rja-api/company

CRUD operations for companies.

## Exports

### `./api/*`

- `createCompany(input)` — insert a new company
- `getCompany(id)` — fetch by ID
- `findCompanyByName(name)` — lookup by name, returns `TCompany | null`
- `listCompanies(input)` — paginated list with search, industry, stage, and size filters
- `updateCompany(input)` — partial update
- `deleteCompany(id)` — delete by ID

All return `Promise<TResult<T>>`.

### `./schema/*`

- `TCompany` — company entity type (name, website, linkedinUrl, size, stage, industry, notes)
- `TCreateCompany`, `TUpdateCompany`, `TListCompanies` — input types
- Zod schemas for each operation
- Marshallers: `unmarshalCompany`, `marshalCreateCompany`, `marshalUpdateCompany`
