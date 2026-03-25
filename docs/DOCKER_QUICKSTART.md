# Docker Quickstart

This document provides instructions on how to run the Auto Job App suite using Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- A `.env` file in the root directory (copy from `.env.example`)

## Getting Started

### 1. Configure Environment Variables

Ensure your `.env` file has the necessary keys, especially:
- `ANTHROPIC_API_KEY`: Required for scoring and document generation.
- `SUPABASE_JWT_SECRET`: A long, secure string (at least 32 characters). You can generate one with:
  ```bash
  openssl rand -base64 32
  ```
- `SUPABASE_PUBLISHABLE_KEY` & `SUPABASE_SECRET_KEY`: These correspond to the Supabase `anon` and `service_role` JWTs respectively. For local development, these can be any unique string as long as they are consistent across your services, but for a "correct" setup that passes JWT validation, you should use tokens signed with your `SUPABASE_JWT_SECRET`.
  > [!TIP]
  > Since these must be valid HS256 JWTs signed with your `SUPABASE_JWT_SECRET`, you can use a tool like [jwt.io](https://jwt.io) or the [Supabase CLI](https://supabase.com/docs/guides/cli) to generate tokens for the `anon` and `service_role` roles.

### 2. Bring the Suite Up

Run the following command to build and start all services in the background:

```bash
docker compose up --build -d
```

This will start:
- **web**: The Next.js dashboard ([http://localhost:43000](http://localhost:43000))
- **scraper**: The job scraping microservice
- **score**: The AI scoring microservice
- **Supabase Stack**: Local Postgres, PostgREST, Auth (GoTrue), and Storage services, all routed through Kong ([http://localhost:48000](http://localhost:48000))

### 3. Verify Health

You can check the status of the containers using:

```bash
docker compose ps
```

Wait until the `db` container shows as `(healthy)` before performing operations that require database access.

## Operational Commands

### Viewing Logs

To follow the logs for all services:

```bash
docker compose logs -f
```

To view logs for a specific service (e.g., the scraper):

```bash
docker compose logs -f scraper
```

### Stopping the Suite

To stop the containers but keep the volumes (Postgres data):

```bash
docker compose stop
```

To remove the containers and the network:

```bash
docker compose down
```

To remove everything, **including database volumes**:

```bash
docker compose down -v
```

### Database Management

The database initialized with migrations located in `apps/supabase/migrations`. If you need to run a manual query or inspect the DB:

```bash
docker compose exec db psql -U postgres
```

## Production Considerations

- **Security**: Change all default passwords and secrets in your production `.env`.
- **Persistence**: Ensure the Docker volumes (`supabase-db` and `supabase-storage`) are backed up regularly.
- **Port Mapping**: You can adjust the host ports in `docker-compose.yml` if `43000`, `48000`, or `45432` are already in use.
