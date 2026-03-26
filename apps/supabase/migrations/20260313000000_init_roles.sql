-- Create Supabase standard schemas
create schema if not exists auth;
create schema if not exists extensions;

-- Create Supabase standard roles if they don't exist
do $$
begin
  if not exists (select from pg_catalog.pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select from pg_catalog.pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select from pg_catalog.pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit;
  end if;
  if not exists (select from pg_catalog.pg_roles where rolname = 'authenticator') then
    create role authenticator noinherit login password 'supabase-postgres';
  end if;
  
  -- Pre-create auth.factor_type to prevent GoTrue migration issues
  if not exists (select from pg_type t join pg_namespace n on t.typnamespace = n.oid where t.typname = 'factor_type' and n.nspname = 'auth') then
    create type auth.factor_type as enum ('totp', 'webauthn', 'phone');
  end if;
end
$$;

grant anon, authenticated, service_role to authenticator;
grant usage on schema auth to postgres, authenticator, authenticated, anon, service_role;
grant all privileges on schema auth to postgres, authenticator, authenticated, anon, service_role;
grant usage on schema extensions to postgres, authenticator, authenticated, anon, service_role;
grant all privileges on schema extensions to postgres, authenticator, authenticated, anon, service_role;
