# @aja-api/person

CRUD operations for people (contacts at companies).

## Exports

### `./api/*`

- `createPerson(input)` — insert a new person
- `getPerson(id)` — fetch by ID
- `listPersons(input)` — paginated list with search, email, and companyId filters
- `updatePerson(input)` — partial update
- `deletePerson(id)` — delete by ID

All return `Promise<TResult<T>>`.

### `./schema/*`

- `TPerson` — person entity type (companyId, name, title, email, linkedinUrl, notes)
- `TCreatePerson`, `TUpdatePerson`, `TListPersons` — input types
- Zod schemas for each operation
- Marshallers: `unmarshalPerson`, `marshalCreatePerson`, `marshalUpdatePerson`
