# @rja-app/home

Dashboard screens and server actions for the web app, with Zustand state management.

## Exports

- `./home-screen` — `HomeScreen` dashboard page
- `./roles-screen` — `RolesScreen` job roles list with filtering/sorting
- `./create-screen` — `CreateScreen` manual role creation

## Dependencies

- `@rja-api/role`, `@rja-api/company`, `@rja-api/score`, `@rja-api/person`, `@rja-api/interaction`, `@rja-api/role-person`, `@rja-api/application`, `@rja-api/resume`, `@rja-api/cover-letter`, `@rja-api/storage` — entity CRUD
- `@rja-config/user` — user profile configuration
- `@rja-core/next-safe-action` — server action client
- `@rja-core/dates` — date formatting
- `@rja-design/ui` — UI components (peer)
- `zustand` (via internal stores)
