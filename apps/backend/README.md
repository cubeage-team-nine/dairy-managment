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