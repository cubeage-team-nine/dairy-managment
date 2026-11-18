from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert

from app.database.session import SessionLocal
from app.modules.feed.model import FeedType


DEFAULT_FEED_TYPES = (
    ("Green Fodder", "kg", "Fresh green fodder."),
    ("Dry Fodder", "kg", "Dry fodder and roughage."),
    ("Concentrate Feed", "kg", "Concentrate animal feed."),
    ("Silage", "kg", "Fermented fodder stored for animal feed."),
    ("Mineral Mixture", "kg", "Mineral supplement for livestock."),
    ("Protein Feed", "kg", "Protein-rich animal feed."),
)


def seed_feed_types() -> int:
    inserted = 0
    with SessionLocal() as db:
        for name, unit, description in DEFAULT_FEED_TYPES:
            exists = db.scalar(
                select(FeedType.id).where(func.lower(FeedType.name) == name.lower())
            )
            if exists is not None:
                continue
            result = db.execute(
                insert(FeedType)
                .values(name=name, unit=unit, description=description)
                .on_conflict_do_nothing(index_elements=[FeedType.name])
            )
            inserted += result.rowcount or 0
        db.commit()
    return inserted


if __name__ == "__main__":
    print(f"Inserted {seed_feed_types()} missing default feed type(s).")
