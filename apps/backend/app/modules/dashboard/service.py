
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.modules.dashboard import repository


def get_admin_dashboard(db: Session, recent_limit: int = 5):
    counts = repository.get_admin_summary_counts(db)
    farmer_rows = repository.get_recent_farmer_registrations(db, recent_limit)
    doctor_rows = repository.get_recent_doctor_registrations(db, recent_limit)

    return {
        **counts,
        "monthly_milk_production": repository.get_monthly_milk_production(db),
        "recent_farmer_registrations": [
            {
                "farmer_id": profile.id,
                "user_id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "mobile_number": user.mobile_number,
                "village": profile.village,
                "account_status": user.status,
                "registered_at": user.created_at,
            }
            for profile, user in farmer_rows
        ],
        "recent_doctor_registrations": [
            {
                "doctor_id": profile.id,
                "user_id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "mobile_number": user.mobile_number,
                "account_status": user.status,
                "registered_at": user.created_at,
                "qualification": profile.qualification,
                "specialization": profile.specialization,
                "registration_number": profile.registration_number,
                "is_verified": user.is_verified,
            }
            for profile, user in doctor_rows
        ],
    }


def get_doctor_dashboard(db: Session, user_id):
    row = repository.get_doctor_profile(db, user_id)
    if row is None:
        raise NotFoundError("Doctor profile not found.")

    profile, user = row
    counts = repository.get_doctor_request_counts(db, profile.id)
    request_rows = repository.get_recent_doctor_requests(db, profile.id)
    treatment_rows = repository.get_recent_doctor_treatments(db, profile.id)

    return {
        "doctor_profile": {
            "full_name": user.full_name,
            "qualification": profile.qualification,
            "specialization": profile.specialization,
            "registration_number": profile.registration_number,
            "experience_years": profile.experience_years,
            "account_status": user.status,
            "is_verified": user.is_verified,
            "is_available": profile.is_available,
        },
        **counts,
        "recent_health_requests": [
            {
                "id": request.id,
                "animal_tag": animal_tag,
                "breed": breed,
                "farm_name": farm_name,
                "farmer_name": farmer_name,
                "request_description": request.request_description,
                "status": request.status,
                "requested_at": request.requested_at,
            }
            for request, animal_tag, breed, farm_name, farmer_name in request_rows
        ],
        "recent_treatments": [
            {
                "id": record.id,
                "animal_tag": animal_tag,
                "farm_name": farm_name,
                "farmer_name": farmer_name,
                "disease": record.disease,
                "treatment": record.treatment,
                "doctor_recommendation": record.doctor_recommendation,
                "visit_date": record.visit_date,
            }
            for record, animal_tag, farm_name, farmer_name in treatment_rows
        ],
    }


def get_farmer_dashboard(db: Session, user_id):
    farmer = repository.get_farmer_profile(db, user_id)

    if not farmer:
        return {
            "farmer_name": "Farmer",
            "total_animals": 0,
            "milking_animals": 0,
            "today_milk": 0.0,
            "monthly_revenue": 0.0,
            "weekly_milk": [],
            "health_alerts": [],
        }

    farmer_name = " ".join(
        part
        for part in [
            farmer.first_name,
            farmer.middle_name,
            farmer.last_name,
        ]
        if part
    )

    return {
        "farmer_name": farmer_name,
        "total_animals": repository.get_total_animals(
            db, farmer.id
        ),
        "milking_animals": repository.get_milking_animals(
            db, farmer.id
        ),
        "today_milk": repository.get_today_milk(
            db, farmer.id
        ),
        "monthly_revenue": repository.get_monthly_revenue(
            db, farmer.id
        ),
        "weekly_milk": repository.get_weekly_milk(
            db, farmer.id
        ),
        "health_alerts": repository.get_health_alerts(
            db, farmer.id
        ),
    }
