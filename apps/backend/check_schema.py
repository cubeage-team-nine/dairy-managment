from sqlalchemy import text
from app.database.session import engine

tables = [
    "users",
    "farmer_profiles",
    "doctor_profiles",
    "farms",
    "animals",
    "doctor_requests",
]

with engine.connect() as conn:
    for table in tables:
        print(f"\n========== {table} ==========")

        result = conn.execute(text("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = :table
            ORDER BY ordinal_position
        """), {"table": table})

        for row in result:
            print(f"{row.column_name} | {row.data_type} | Nullable: {row.is_nullable}")
