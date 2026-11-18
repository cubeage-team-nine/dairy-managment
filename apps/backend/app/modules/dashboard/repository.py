
from datetime import date, timedelta

from sqlalchemy import DateTime, String, case, cast, func
from sqlalchemy.orm import Session

from app.core.constants import AccountStatus, AnimalStatus, RequestStatus, UserRole
from app.modules.animals.model import Animal
from app.modules.doctor_requests.model import DoctorRequest
from app.modules.farmers.model import FarmerProfile
from app.modules.doctors.model import DoctorProfile
from app.modules.farms.model import Farm
from app.modules.pans.model import Pan
from app.modules.milk.model import MilkRecord
from app.modules.health.model import HealthRecord
from app.modules.users.model import User
from app.modules.milk_centers.model import MilkCenter


def _count_users(db: Session, *filters):
    return db.query(func.count(User.id)).filter(*filters).scalar() or 0


def get_admin_summary_counts(db: Session):
    # Milk center count — table may not exist yet; handle gracefully
    try:
        total_milk_centers = db.query(func.count(MilkCenter.id)).scalar() or 0
    except Exception:
        # A failed PostgreSQL query leaves the transaction aborted. Roll it back
        # before running the remaining dashboard queries.
        db.rollback()
        total_milk_centers = 0

    return {
        "total_registered_farmers": _count_users(
            db, User.role == UserRole.FARMER
        ),
        "total_registered_doctors": _count_users(
            db, User.role == UserRole.DOCTOR
        ),
        "total_admin_users": _count_users(db, User.role == UserRole.ADMIN),
        "total_registered_users": _count_users(db),
        "pending_doctor_registration_requests": _count_users(
            db,
            User.role == UserRole.DOCTOR,
            User.status == AccountStatus.ACTIVE,
            User.is_verified.is_(False),
        ),
        "approved_doctors": _count_users(
            db,
            User.role == UserRole.DOCTOR,
            User.is_verified.is_(True),
        ),
        "rejected_doctors": _count_users(
            db,
            User.role == UserRole.DOCTOR,
            # Older databases may not have the REJECTED enum value yet. Cast
            # to text so this read-only dashboard remains available until the
            # account-status migration is applied.
            cast(User.status, String) == AccountStatus.REJECTED.value,
        ),
        "active_farmers": _count_users(
            db,
            User.role == UserRole.FARMER,
            User.status == AccountStatus.ACTIVE,
        ),
        "inactive_farmers": _count_users(
            db,
            User.role == UserRole.FARMER,
            User.status.in_([AccountStatus.INACTIVE, AccountStatus.SUSPENDED]),
        ),
        "total_farms": db.query(func.count(Farm.id)).scalar() or 0,
        "total_animals": db.query(func.count(Animal.id)).filter(
            Animal.status == AnimalStatus.ACTIVE
        ).scalar() or 0,
        "total_milk_production": float(
            db.query(func.coalesce(func.sum(MilkRecord.total_quantity), 0)).scalar() or 0
        ),
        "total_milk_centers": total_milk_centers,
    }


# Keep old name as alias for backward compatibility
def get_admin_user_counts(db: Session):
    return get_admin_summary_counts(db)


def get_recent_farmer_registrations(db: Session, limit: int):
    return (
        db.query(FarmerProfile, User)
        .join(User, FarmerProfile.user_id == User.id)
        .order_by(User.created_at.desc())
        .limit(limit)
        .all()
    )


def get_recent_doctor_registrations(db: Session, limit: int):
    return (
        db.query(DoctorProfile, User)
        .join(User, DoctorProfile.user_id == User.id)
        .order_by(User.created_at.desc())
        .limit(limit)
        .all()
    )


def get_monthly_milk_production(db: Session, months: int = 6):
    today = date.today()
    start_year, start_month = today.year, today.month
    for _ in range(months - 1):
        start_month -= 1
        if start_month == 0:
            start_year -= 1
            start_month = 12
    start_date = date(start_year, start_month, 1)

    month_expression = func.date_trunc(
        "month",
        cast(MilkRecord.record_date, DateTime),
    )
    records = (
        db.query(
            month_expression.label("month"),
            func.coalesce(func.sum(MilkRecord.total_quantity), 0).label("milk"),
        )
        .filter(
            MilkRecord.record_date >= start_date,
            MilkRecord.record_date <= today,
        )
        .group_by(month_expression)
        .order_by(month_expression)
        .all()
    )
    values_by_month = {
        record.month.strftime("%Y-%m"): float(record.milk or 0)
        for record in records
    }

    monthly_values = []
    year, month = start_year, start_month
    for _ in range(months):
        month_date = date(year, month, 1)
        monthly_values.append(
            {
                "month": month_date.strftime("%b %Y"),
                "milk": values_by_month.get(month_date.strftime("%Y-%m"), 0.0),
            }
        )
        month += 1
        if month == 13:
            year += 1
            month = 1

    return monthly_values


def get_doctor_profile(db: Session, user_id):
    return (
        db.query(DoctorProfile, User)
        .join(User, DoctorProfile.user_id == User.id)
        .filter(
            DoctorProfile.user_id == user_id,
            User.role == UserRole.DOCTOR,
        )
        .first()
    )


def get_doctor_request_counts(db: Session, doctor_id):
    row = (
        db.query(
            func.count(DoctorRequest.id),
            func.coalesce(
                func.sum(case((DoctorRequest.status == RequestStatus.PENDING, 1), else_=0)),
                0,
            ),
            func.coalesce(
                func.sum(case((DoctorRequest.status == RequestStatus.ACCEPTED, 1), else_=0)),
                0,
            ),
            func.coalesce(
                func.sum(case((DoctorRequest.status == RequestStatus.REJECTED, 1), else_=0)),
                0,
            ),
            func.coalesce(
                func.sum(case((DoctorRequest.status == RequestStatus.COMPLETED, 1), else_=0)),
                0,
            ),
        )
        .filter(DoctorRequest.doctor_id == doctor_id)
        .one()
    )
    return {
        "total_health_requests": int(row[0] or 0),
        "pending_requests": int(row[1] or 0),
        "accepted_requests": int(row[2] or 0),
        "rejected_requests": int(row[3] or 0),
        "completed_treatments": int(row[4] or 0),
    }


def get_recent_doctor_requests(db: Session, doctor_id, limit: int = 5):
    return (
        db.query(
            DoctorRequest,
            Animal.tag_number,
            Animal.breed,
            Farm.name,
            User.full_name,
        )
        .join(Animal, DoctorRequest.animal_id == Animal.id)
        .join(Pan, Animal.pan_id == Pan.id)
        .join(Farm, Pan.farm_id == Farm.id)
        .join(FarmerProfile, DoctorRequest.farmer_id == FarmerProfile.id)
        .join(User, FarmerProfile.user_id == User.id)
        .filter(DoctorRequest.doctor_id == doctor_id)
        .order_by(DoctorRequest.requested_at.desc())
        .limit(limit)
        .all()
    )


def get_recent_doctor_treatments(db: Session, doctor_id, limit: int = 5):
    return (
        db.query(
            HealthRecord,
            Animal.tag_number,
            Farm.name,
            User.full_name,
        )
        .join(Animal, HealthRecord.animal_id == Animal.id)
        .join(Pan, Animal.pan_id == Pan.id)
        .join(Farm, Pan.farm_id == Farm.id)
        .join(FarmerProfile, Farm.farmer_id == FarmerProfile.id)
        .join(User, FarmerProfile.user_id == User.id)
        .filter(
            HealthRecord.doctor_id == doctor_id,
            HealthRecord.treatment.is_not(None),
            func.trim(HealthRecord.treatment) != "",
        )
        .order_by(HealthRecord.visit_date.desc())
        .limit(limit)
        .all()
    )


def get_farmer_profile(db: Session, user_id):
    return (
        db.query(FarmerProfile)
        .filter(FarmerProfile.user_id == user_id)
        .first()
    )


def get_farmer_farm_ids(db: Session, farmer_id):
    return (
        db.query(Farm.id)
        .filter(Farm.farmer_id == farmer_id)
        .scalar_subquery()
    )


def get_total_animals(db: Session, farmer_id):
    return (
        db.query(func.count(Animal.id))
        .join(Pan, Animal.pan_id == Pan.id)
        .join(Farm, Pan.farm_id == Farm.id)
        .filter(
            Farm.farmer_id == farmer_id,
            Animal.status == AnimalStatus.ACTIVE,
        )
        .scalar()
    ) or 0


def get_today_milk(db: Session, farmer_id):
    today = date.today()

    result = (
        db.query(func.coalesce(func.sum(MilkRecord.total_quantity), 0))
        .join(Farm, MilkRecord.farm_id == Farm.id)
        .filter(
            Farm.farmer_id == farmer_id,
            MilkRecord.record_date == today,
        )
        .scalar()
    )

    return float(result or 0)


def get_milking_animals(db: Session, farmer_id):
    today = date.today()

    return (
        db.query(func.count(func.distinct(MilkRecord.animal_id)))
        .join(Farm, MilkRecord.farm_id == Farm.id)
        .filter(
            Farm.farmer_id == farmer_id,
            MilkRecord.record_date == today,
            MilkRecord.animal_id.is_not(None),
        )
        .scalar()
    ) or 0


def get_monthly_revenue(db: Session, farmer_id):
    today = date.today()
    month_start = today.replace(day=1)

    result = (
        db.query(func.coalesce(func.sum(MilkRecord.milk_value), 0))
        .join(Farm, MilkRecord.farm_id == Farm.id)
        .filter(
            Farm.farmer_id == farmer_id,
            MilkRecord.record_date >= month_start,
            MilkRecord.record_date <= today,
        )
        .scalar()
    )

    return float(result or 0)


def get_weekly_milk(db: Session, farmer_id):
    today = date.today()
    start_date = today - timedelta(days=6)

    records = (
        db.query(
            MilkRecord.record_date,
            func.coalesce(func.sum(MilkRecord.total_quantity), 0).label("quantity"),
        )
        .join(Farm, MilkRecord.farm_id == Farm.id)
        .filter(
            Farm.farmer_id == farmer_id,
            MilkRecord.record_date >= start_date,
            MilkRecord.record_date <= today,
        )
        .group_by(MilkRecord.record_date)
        .order_by(MilkRecord.record_date)
        .all()
    )

    records_by_date = {
        record.record_date: float(record.quantity or 0)
        for record in records
    }

    return [
        {
            "date": (start_date + timedelta(days=i)).isoformat(),
            "day": (start_date + timedelta(days=i)).strftime("%a"),
            "quantity": records_by_date.get(
                start_date + timedelta(days=i), 0.0
            ),
        }
        for i in range(7)
    ]


def get_health_alerts(db: Session, farmer_id):
    records = (
        db.query(HealthRecord, Animal.tag_number)
        .join(Animal, HealthRecord.animal_id == Animal.id)
        .join(Pan, Animal.pan_id == Pan.id)
        .join(Farm, Pan.farm_id == Farm.id)
        .filter(Farm.farmer_id == farmer_id)
        .order_by(HealthRecord.visit_date.desc())
        .limit(5)
        .all()
    )

    return [
        {
            "id": str(record.id),
            "animal_tag": tag_number,
            "message": (
                record.disease
                or record.doctor_recommendation
                or record.treatment
                or "Health record available"
            ),
            "visit_date": record.visit_date.isoformat(),
        }
        for record, tag_number in records
    ]
