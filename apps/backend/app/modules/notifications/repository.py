from sqlalchemy.orm import Session

from app.modules.notifications.model import Notification


def list_user_reminders(db: Session, user_id):
    return db.query(Notification).filter(Notification.user_id == user_id).order_by(
        Notification.reminder_date.asc(), Notification.created_at.desc()
    ).all()


def get_user_reminder(db: Session, reminder_id, user_id):
    return db.query(Notification).filter(
        Notification.id == reminder_id, Notification.user_id == user_id
    ).first()
