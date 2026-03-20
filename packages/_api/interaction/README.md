# @aja-api/interaction

CRUD operations for interactions (communications, interviews, etc.) linked to roles and people.

## Exports

### `./api/*`

- `createInteraction(input)` — insert a new interaction
- `getInteraction(id)` — fetch by ID
- `listInteractions(input)` — paginated list with roleId, personId, and type filters
- `updateInteraction(input)` — partial update
- `deleteInteraction(id)` — delete by ID

All return `Promise<TResult<T>>`.

### `./schema/*`

- `TInteraction` — interaction entity type (roleId, personId, type, notes)
- `TCreateInteraction`, `TUpdateInteraction`, `TListInteractions` — input types
- Zod schemas for each operation
- Marshallers: `unmarshalInteraction`, `marshalCreateInteraction`, `marshalUpdateInteraction`
