
import uuid
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict

from app.core.constants import AccountStatus, RequestStatus


class WeeklyMilkItem(BaseModel):
    date: date
    day: str
    quantity: float


class HealthAlertItem(BaseModel):
    id: str
    animal_tag: str | None = None
    message: str
    visit_date: date


class FarmerDashboardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    farmer_name: str
    total_animals: int
    milking_animals: int
    today_milk: float
    monthly_revenue: float
    weekly_milk: list[WeeklyMilkItem]
    health_alerts: list[HealthAlertItem]


class DoctorDashboardProfile(BaseModel):
    full_name: str | None
    qualification: str | None
    specialization: str | None
    registration_number: str | None
    experience_years: int | None
    account_status: AccountStatus
    is_verified: bool
    is_available: bool = True


class DoctorDashboardRequestItem(BaseModel):
    id: uuid.UUID
    animal_tag: str
    breed: str | None
    farm_name: str
    farmer_name: str | None
    request_description: str | None
    status: RequestStatus
    requested_at: datetime


class DoctorDashboardTreatmentItem(BaseModel):
    id: uuid.UUID
    animal_tag: str
    farm_name: str
    farmer_name: str | None
    disease: str | None
    treatment: str | None
    doctor_recommendation: str | None
    visit_date: date


class DoctorDashboardResponse(BaseModel):
    doctor_profile: DoctorDashboardProfile
    total_health_requests: int
    pending_requests: int
    accepted_requests: int
    rejected_requests: int
    completed_treatments: int
    recent_health_requests: list[DoctorDashboardRequestItem]
    recent_treatments: list[DoctorDashboardTreatmentItem]


class RecentFarmerRegistration(BaseModel):
    farmer_id: uuid.UUID
    user_id: uuid.UUID
    full_name: str | None
    email: str | None
    mobile_number: str
    village: str | None
    account_status: AccountStatus
    registered_at: datetime


class RecentDoctorRegistration(BaseModel):
    doctor_id: uuid.UUID
    user_id: uuid.UUID
    full_name: str | None
    email: str | None
    mobile_number: str
    qualification: str | None
    specialization: str | None
    registration_number: str | None
    account_status: AccountStatus
    is_verified: bool
    registered_at: datetime


class MonthlyMilkProduction(BaseModel):
    month: str
    milk: float


class AdminDashboardResponse(BaseModel):
    # User counts
    total_registered_farmers: int
    total_registered_doctors: int
    total_admin_users: int
    total_registered_users: int
    # Doctor workflow
    pending_doctor_registration_requests: int
    approved_doctors: int
    rejected_doctors: int
    # Farmer status
    active_farmers: int
    inactive_farmers: int
    # Additional module counts
    total_farms: int
    total_animals: int
    total_milk_production: float
    total_milk_centers: int
    # Recent records
    recent_farmer_registrations: list[RecentFarmerRegistration]
    recent_doctor_registrations: list[RecentDoctorRegistration]
    monthly_milk_production: list[MonthlyMilkProduction]
