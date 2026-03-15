# @aja-core/result

Result type for explicit error handling without exceptions, inspired by Rust's `Result`.

## Exports

- `TResult<T, E>` — discriminated union: `{ ok: true; data: T }` or `{ ok: false; error: E }`
- `ok(data)` — create a success result
- `err(error)` / `errFrom(message)` — create an error result
