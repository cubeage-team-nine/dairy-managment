from pathlib import Path
import uuid

from app.core.exceptions import NotFoundError

DOCTOR_PHOTO_STORAGE = Path(__file__).resolve().parents[3] / "uploads" / "doctor_photos"


def save_doctor_photo(content: bytes, suffix: str) -> str:
    DOCTOR_PHOTO_STORAGE.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{suffix}"
    (DOCTOR_PHOTO_STORAGE / filename).write_bytes(content)
    return filename


def doctor_photo_path(filename: str) -> Path:
    if Path(filename).name != filename:
        raise NotFoundError("Doctor profile photo not found.")
    path = (DOCTOR_PHOTO_STORAGE / filename).resolve()
    if DOCTOR_PHOTO_STORAGE.resolve() not in path.parents or not path.is_file():
        raise NotFoundError("Doctor profile photo not found.")
    return path


def delete_doctor_photo(filename: str | None) -> None:
    if filename:
        path = doctor_photo_path(filename)
        path.unlink(missing_ok=True)
