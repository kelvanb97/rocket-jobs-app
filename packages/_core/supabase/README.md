# @aja-core/supabase

Supabase admin client factory and environment configuration.

## Exports

### `./admin`

- `supabaseAdminClient<Database>()` — returns an authenticated `SupabaseClient` using the service role key

### `./config`

- `config()` — singleton getter for validated Supabase configuration (url, publishableKey, secretKey)
- `Config` — configuration type

Environment variables validated via Zod: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`.
