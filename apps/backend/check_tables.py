from sqlalchemy import text
from app.database.session import engine

with engine.connect() as conn:
    result = conn.execute(text(
        "SELECT tablename FROM pg_tables "
        "WHERE schemaname = 'public' ORDER BY tablename"
    ))
    for row in result:
        print(row[0])
