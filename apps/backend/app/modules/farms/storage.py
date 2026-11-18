from pathlib import Path
import uuid

from app.core.exceptions import NotFoundError


FARM_PHOTO_STORAGE = Path(__file__).resolve().parents[3] / "uploads" / "farm_photos"


def save_farm_photo(storage_key: str, content: bytes) -> Path:
    if Path(storage_key).name != storage_key:
        raise ValueError("Invalid farm photo storage key.")

    FARM_PHOTO_STORAGE.mkdir(parents=True, exist_ok=True)
    path = FARM_PHOTO_STORAGE / storage_key
    with path.open("xb") as photo_file:
        photo_file.write(content)
    return path


def create_storage_key(extension: str) -> str:
    return f"{uuid.uuid4().hex}{extension}"


def get_farm_photo_path(storage_key: str) -> Path:
    normalized_key = storage_key.replace("\\", "/")
    relative_path = Path(*normalized_key.split("/"))
    if relative_path.is_absolute() or ".." in relative_path.parts:
        raise NotFoundError("Farm photo file was not found.")

    root = FARM_PHOTO_STORAGE.resolve()
    path = (root / relative_path).resolve()
    if root not in path.parents or not path.is_file():
        raise NotFoundError("Farm photo file was not found.")
    return path


def delete_farm_photo_file(storage_key: str) -> None:
    path = get_farm_photo_path(storage_key)
    path.unlink()
