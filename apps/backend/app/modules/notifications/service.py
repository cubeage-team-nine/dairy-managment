import uuid
from datetime import date

from sqlalchemy.orm import Session

from app.core.constants import RequestStatus, UserRole
from app.core.exceptions import NotFoundError
from app.modules.animals.model import Animal
from app.modules.breeding.model import BreedingRecord
from app.modules.dashboard.repository import get_doctor_profile, get_farmer_profile
from app.modules.doctor_requests.model import DoctorRequest
from app.modules.doctors.model import DoctorProfile
from app.modules.farmers.model import FarmerProfile
from app.modules.farms.model import Farm
from app.modules.health.model import HealthRecord
from app.modules.mastitis.model import MastitisRecord
from app.modules.notifications.model import Notification
from app.modules.notifications.repository import get_user_reminder, list_user_reminders
from app.modules.pans.model import Pan
from app.modules.users.model import User


def _reminder_item(row):
    animal = row.animal
    return {
        "id": row.id, "title": row.title, "description": row.description,
        "category": row.category, "reminder_date": row.reminder_date,
        "status": row.status, "is_read": row.is_read, "animal_id": row.animal_id,
        "source": "FARMER_REMINDER", "animal_tag": animal.tag_number if animal else None,
        "animal_name": animal.tag_number if animal else None,
        "farm_name": animal.pan.farm.name if animal and animal.pan and animal.pan.farm else None,
        "updated_at": row.updated_at,
    }


def _animal_context(db, animal_id):
    return db.query(Animal, Farm, FarmerProfile, User).join(
        Pan, Animal.pan_id == Pan.id
    ).join(Farm, Pan.farm_id == Farm.id).join(
        FarmerProfile, Farm.farmer_id == FarmerProfile.id
    ).join(User, FarmerProfile.user_id == User.id).filter(Animal.id == animal_id).first()


def _system_item(db, animal_id, title, description, reminder_date, category, doctor_name=None, status="PENDING"):
    if reminder_date is None:
        return None
    context = _animal_context(db, animal_id)
    if context is None:
        return None
    animal, farm, farmer, user = context
    return {
        "id": f"{category}:{animal_id}:{reminder_date}", "title": title,
        "description": description, "category": category, "reminder_date": reminder_date,
        "status": status, "is_read": False, "animal_id": animal.id,
        "animal_tag": animal.tag_number, "animal_name": animal.tag_number,
        "farm_name": farm.name, "farmer_name": user.full_name or " ".join(
            filter(None, [farmer.first_name, farmer.middle_name, farmer.last_name])
        ), "doctor_name": doctor_name, "source": "WORKFLOW_RECORD",
    }


def _farmer_system_items(db, farmer_id):
    rows = db.query(HealthRecord, Animal.tag_number).join(
        Animal, HealthRecord.animal_id == Animal.id
    ).join(Pan, Animal.pan_id == Pan.id).join(Farm, Pan.farm_id == Farm.id).filter(
        Farm.farmer_id == farmer_id, HealthRecord.follow_up_date.is_not(None)
    ).all()
    result = []
    for record, _ in rows:
        doctor = record.doctor
        doc_name = None
        if doctor:
            doc_name = doctor.user.full_name or " ".join(filter(None, [doctor.first_name, doctor.middle_name, doctor.last_name]))
        item = _system_item(db, record.animal_id, "Treatment follow-up", record.disease or record.treatment,
                            record.follow_up_date, "TREATMENT_FOLLOW_UP", doc_name,
                            "COMPLETED" if (record.health_status or "").lower() in {"completed", "recovered"} else "PENDING")
        if item: result.append(item)
    rows = db.query(MastitisRecord).join(Animal, MastitisRecord.animal_id == Animal.id).join(
        Pan, Animal.pan_id == Pan.id
    ).join(Farm, Pan.farm_id == Farm.id).filter(
        Farm.farmer_id == farmer_id, MastitisRecord.follow_up_date.is_not(None)
    ).all()
    for record in rows:
        item = _system_item(db, record.animal_id, "Mastitis follow-up", record.diagnosis or record.symptoms,
                            record.follow_up_date, "MASTITIS_FOLLOW_UP",
                            status="COMPLETED" if (record.status or "").upper() == "RECOVERED" else "PENDING")
        if item: result.append(item)
    rows = db.query(BreedingRecord).join(Animal, BreedingRecord.animal_id == Animal.id).join(
        Pan, Animal.pan_id == Pan.id
    ).join(Farm, Pan.farm_id == Farm.id).filter(Farm.farmer_id == farmer_id).all()
    for record in rows:
        if record.pregnancy_confirmation_date:
            item = _system_item(db, record.animal_id, "Pregnancy confirmation recorded", None,
                                record.pregnancy_confirmation_date, "PREGNANCY_CONFIRMATION")
            if item: result.append(item)
        if record.calving_date:
            item = _system_item(db, record.animal_id, "Calving date recorded", None,
                                record.calving_date, "CALVING_UPDATE")
            if item: result.append(item)
    return result


def list_notifications(db: Session, user: User):
    if user.role == UserRole.FARMER:
        farmer = get_farmer_profile(db, user.id)
        if farmer is None:
            raise NotFoundError("Farmer profile not found.")
        items = [_reminder_item(row) for row in list_user_reminders(db, user.id)]
        items.extend(_farmer_system_items(db, farmer.id))
        return {"items": sorted(items, key=lambda item: item["reminder_date"] or date.min)}

    if user.role == UserRole.DOCTOR:
        profile = get_doctor_profile(db, user.id)
        if profile is None:
            raise NotFoundError("Doctor profile not found.")
        doctor = profile[0]
        assigned = db.query(DoctorRequest.animal_id).filter(
            DoctorRequest.doctor_id == doctor.id,
            DoctorRequest.status.in_([RequestStatus.ACCEPTED, RequestStatus.COMPLETED]),
        )
        records = db.query(HealthRecord).filter(
            HealthRecord.follow_up_date.is_not(None),
            (HealthRecord.doctor_id == doctor.id) | HealthRecord.animal_id.in_(assigned),
        ).all()
        items = []
        for record in records:
            doctor_name = user.full_name or " ".join(filter(None, [doctor.first_name, doctor.middle_name, doctor.last_name]))
            item = _system_item(db, record.animal_id, "Treatment follow-up", record.disease or record.treatment,
                                record.follow_up_date, "TREATMENT_FOLLOW_UP", doctor_name,
                                "COMPLETED" if (record.health_status or "").lower() in {"completed", "recovered"} else "PENDING")
            if item: items.append(item)
        mastitis = db.query(MastitisRecord).filter(
            MastitisRecord.follow_up_date.is_not(None),
            (MastitisRecord.doctor_id == doctor.id) | MastitisRecord.animal_id.in_(assigned),
        ).all()
        for record in mastitis:
            item = _system_item(db, record.animal_id, "Mastitis follow-up", record.diagnosis or record.symptoms,
                                record.follow_up_date, "MASTITIS_FOLLOW_UP", user.full_name,
                                "COMPLETED" if (record.status or "").upper() == "RECOVERED" else "PENDING")
            if item: items.append(item)
        return {"items": sorted(items, key=lambda item: item["reminder_date"] or date.min)}

    # Admin receives existing workflow dates across the system, without exposing farmer-created reminders.
    health = db.query(HealthRecord).filter(HealthRecord.follow_up_date.is_not(None)).all()
    mastitis = db.query(MastitisRecord).filter(MastitisRecord.follow_up_date.is_not(None)).all()
    breeding = db.query(BreedingRecord).all()
    items = []
    for record in health:
        item = _system_item(db, record.animal_id, "Treatment follow-up", record.disease or record.treatment,
                            record.follow_up_date, "TREATMENT_FOLLOW_UP",
                            status="COMPLETED" if (record.health_status or "").lower() in {"completed", "recovered"} else "PENDING")
        if item: items.append(item)
    for record in mastitis:
        item = _system_item(db, record.animal_id, "Mastitis follow-up", record.diagnosis or record.symptoms,
                            record.follow_up_date, "MASTITIS_FOLLOW_UP",
                            status="COMPLETED" if (record.status or "").upper() == "RECOVERED" else "PENDING")
        if item: items.append(item)
    for record in breeding:
        if record.pregnancy_confirmation_date:
            item = _system_item(db, record.animal_id, "Pregnancy confirmation recorded", None,
                                record.pregnancy_confirmation_date, "PREGNANCY_CONFIRMATION")
            if item: items.append(item)
        if record.calving_date:
            item = _system_item(db, record.animal_id, "Calving date recorded", None,
                                record.calving_date, "CALVING_UPDATE")
            if item: items.append(item)
    return {"items": sorted(items, key=lambda item: item["reminder_date"] or date.min)}


def create_reminder(db: Session, user: User, data: dict):
    animal_id = data.get("animal_id")
    if animal_id:
        farmer = get_farmer_profile(db, user.id)
        valid = db.query(Animal.id).join(Pan, Animal.pan_id == Pan.id).join(
            Farm, Pan.farm_id == Farm.id
        ).filter(Animal.id == animal_id, Farm.farmer_id == farmer.id).first()
        if not valid:
            raise NotFoundError("Animal not found on your farm.")
    row = Notification(user_id=user.id, **data)
    db.add(row)
    db.commit()
    db.refresh(row)
    return _reminder_item(row)


def update_reminder(db: Session, reminder_id: uuid.UUID, user_id: uuid.UUID, data: dict):
    row = get_user_reminder(db, reminder_id, user_id)
    if row is None:
        raise NotFoundError("Reminder not found.")
    if data.get("animal_id"):
        user = db.get(User, user_id)
        farmer = get_farmer_profile(db, user_id)
        valid = db.query(Animal.id).join(Pan, Animal.pan_id == Pan.id).join(Farm, Pan.farm_id == Farm.id).filter(
            Animal.id == data["animal_id"], Farm.farmer_id == farmer.id
        ).first()
        if not valid:
            raise NotFoundError("Animal not found on your farm.")
    if "status" in data and data["status"] not in {"PENDING", "COMPLETED"}:
        data.pop("status")
    for key, value in data.items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return _reminder_item(row)


def delete_reminder(db: Session, reminder_id: uuid.UUID, user_id: uuid.UUID):
    row = get_user_reminder(db, reminder_id, user_id)
    if row is None:
        raise NotFoundError("Reminder not found.")
    db.delete(row)
    db.commit()
