# @aja-api/role-person

Manage many-to-many relationships between roles and people.

## Exports

### `./api/*`

- `linkRolePerson(input)` — create a role-person link with optional relationship
- `unlinkRolePerson(roleId, personId)` — remove a link
- `updateRolePerson(input)` — update the relationship
- `listPersonsByRole(roleId)` — all people linked to a role
- `listRolesByPerson(personId)` — all roles linked to a person

All return `Promise<TResult<T>>`.

### `./schema/*`

- `TRolePerson` — junction entity type (roleId, personId, relationship)
- `TLinkRolePerson`, `TUpdateRolePerson` — input types
- Zod schemas for each operation
- Marshallers: `unmarshalRolePerson`, `marshalLinkRolePerson`, `marshalUpdateRolePerson`
