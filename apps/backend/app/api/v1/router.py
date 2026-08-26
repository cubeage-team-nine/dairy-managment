from fastapi import APIRouter

from app.modules.auth.router import router as auth_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])

# Other module routers are registered here as they're implemented, e.g.:
# from app.modules.farmers.router import router as farmers_router
# api_router.include_router(farmers_router, prefix="/farmers", tags=["farmers"])
