from collections.abc import Generator

from sqlalchemy.orm import Session, sessionmaker

from app.database import models  # noqa: F401 — registers every model so cross-module
# relationship() string references (e.g. "Farm") resolve for any code path that opens a
# session, not just the FastAPI app (scripts, Alembic, tests, the REPL, etc.).
from app.database.connection import engine

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, future=True)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
