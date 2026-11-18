# Smart Dairy Manager - Backend

Python + FastAPI + SQLAlchemy 2.x + Alembic + PostgreSQL API for the Smart Dairy Manager platform.

## Structure

- `app/core` — configuration, security, logging, exceptions
- `app/database` — SQLAlchemy engine/session setup
- `app/api/v1` — versioned API router aggregation
- `app/middleware` — cross-cutting HTTP middleware
- `app/common` — shared dependencies, pagination, response helpers
- `app/modules` — feature modules (router, schema, model, service, repository)
- `alembic` — database migrations
- `tests` — unit and integration tests

See `.env.example` for required environment variables.

## Default feed types

From `apps/backend`, run the idempotent seed after configuring the database:

```powershell
.\venv\Scripts\python.exe -m app.modules.feed.seed
```

It inserts any missing default feed types with `kg` as their initial unit and
leaves existing feed type configuration unchanged.

## Initial Admin account

Configure `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the local backend environment
before creating the initial administrator. Use the requested initial credentials
for these values; do not put the password in source control. The current User
model also requires a unique mobile number, so set `ADMIN_MOBILE_NUMBER` if the
default placeholder is already in use.

From `apps/backend`, create the account with:

```powershell
.\venv\Scripts\python.exe -m app.modules.auth.seed_admin
```

The command hashes the password and creates an active, verified Admin account
only when the configured email is not already registered. Re-running it does
not reset an existing account's password.

Admin authentication is available at `POST /api/v1/auth/admin/login`. The
Animals, Feed Records, Feed Types, Reports, Dashboard, and other Admin APIs
require an authenticated `ADMIN` role; the ordinary Farmer and Doctor routes
remain role-restricted.