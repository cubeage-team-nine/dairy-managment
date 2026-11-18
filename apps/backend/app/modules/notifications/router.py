import uuid

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.common.dependencies import get_db
from app.core.constants import UserRole
from app.modules.auth.dependencies import get_current_user, require_roles
from app.modules.notifications.schema import ReminderCreate, ReminderUpdate
from app.modules.notifications.service import create_reminder, delete_reminder, list_notifications, update_reminder

router = APIRouter()


@router.get("")
def get_notifications(db: Session = Depends(get_db), current_user=Depends(require_roles(UserRole.FARMER, UserRole.DOCTOR, UserRole.ADMIN))):
    return list_notifications(db, current_user)


@router.post("", status_code=status.HTTP_201_CREATED)
def post_reminder(payload: ReminderCreate, db: Session = Depends(get_db), current_user=Depends(require_roles(UserRole.FARMER))):
    return create_reminder(db, current_user, payload.model_dump())


@router.patch("/{reminder_id}")
def patch_reminder(reminder_id: uuid.UUID, payload: ReminderUpdate, db: Session = Depends(get_db), current_user=Depends(require_roles(UserRole.FARMER))):
    data = payload.model_dump(exclude_unset=True)
    return update_reminder(db, reminder_id, current_user.id, data)


@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_reminder(reminder_id: uuid.UUID, db: Session = Depends(get_db), current_user=Depends(require_roles(UserRole.FARMER))):
    delete_reminder(db, reminder_id, current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
