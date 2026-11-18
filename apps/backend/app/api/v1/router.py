from fastapi import APIRouter

from app.modules.auth.router import router as auth_router
from app.modules.farmers.router import router as farmers_router
from app.modules.animals.router import admin_router as admin_animals_router
from app.modules.animals.router import router as animals_router
from app.modules.animals.router import doctor_router as doctor_animals_router
from app.modules.breeding.router import router as breeding_router
from app.modules.dashboard.router import router as dashboard_router
from app.modules.dashboard.router import admin_router as admin_dashboard_router
from app.modules.dashboard.router import doctor_router as doctor_dashboard_router
from app.modules.doctor_requests.router import router as farmer_health_requests_router
from app.modules.doctor_requests.router import doctor_router as doctor_health_requests_router
from app.modules.doctors.router import admin_router as admin_doctors_router
from app.modules.doctors.router import router as doctors_router
from app.modules.doctors.router import farmer_router as farmer_doctors_router
from app.modules.finance.router import router as finance_router
from app.modules.farms.router import router as farms_router
from app.modules.farms.router import admin_farms_router
from app.modules.feed.router import admin_records_router as admin_feed_records_router
from app.modules.feed.router import admin_router as admin_feed_types_router
from app.modules.feed.router import router as feed_router
from app.modules.health.router import router as farmer_health_records_router
from app.modules.health.router import doctor_router as doctor_health_records_router
from app.modules.milk.router import router as milk_router
from app.modules.milk_centers.router import router as milk_centers_router
from app.modules.mastitis.router import router as mastitis_router
from app.modules.mastitis.router import doctor_router as doctor_mastitis_router
from app.modules.notifications.router import router as notifications_router
from app.modules.pans.router import router as pans_router
from app.modules.reports.router import router as admin_reports_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(doctors_router, prefix="/doctors", tags=["Doctors"])
api_router.include_router(farmer_doctors_router)
api_router.include_router(farmers_router, prefix="/farmers", tags=["Farmers"])
api_router.include_router(admin_doctors_router)
api_router.include_router(admin_animals_router)
api_router.include_router(admin_feed_records_router)
api_router.include_router(admin_reports_router)
api_router.include_router(admin_dashboard_router)
api_router.include_router(admin_farms_router)
api_router.include_router(milk_centers_router)
api_router.include_router(doctor_dashboard_router)
api_router.include_router(doctor_health_requests_router)
api_router.include_router(doctor_animals_router)
api_router.include_router(doctor_health_records_router)
api_router.include_router(doctor_mastitis_router)
# Dashboard router already has its own prefix and tags
api_router.include_router(dashboard_router)
api_router.include_router(farms_router, prefix="/farms", tags=["Farms"])
api_router.include_router(pans_router, prefix="/pans", tags=["Pans"])
api_router.include_router(animals_router, prefix="/animals", tags=["Animals"])
api_router.include_router(milk_router, prefix="/milk", tags=["Milk"])
api_router.include_router(breeding_router, prefix="/breeding", tags=["Breeding"])
api_router.include_router(feed_router, prefix="/feed", tags=["Feed"])
api_router.include_router(admin_feed_types_router)
api_router.include_router(finance_router, prefix="/finance", tags=["Finance"])
api_router.include_router(mastitis_router, prefix="/mastitis", tags=["Mastitis"])
api_router.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(
    farmer_health_requests_router,
    prefix="/farmer/health-requests",
    tags=["Farmer Health Requests"],
)
api_router.include_router(
    farmer_health_records_router,
    prefix="/farmer/health-records",
    tags=["Farmer Health Records"],
)
