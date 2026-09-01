from fastapi import APIRouter

from app.modules.auth.router import router as auth_router
from app.modules.farmers.router import router as farmers_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(farmers_router, prefix="/farmers", tags=["farmers"])

# Other module routers are registered here as they're implemented, following the
# same pattern as farmers_router above:
# from app.modules.doctors.router import router as doctors_router
# api_router.include_router(doctors_router, prefix="/doctors", tags=["doctors"])
