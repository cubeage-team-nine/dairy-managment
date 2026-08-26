from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import AppError, ConflictError, ForbiddenError, NotFoundError, UnauthorizedError
from app.core.logging import configure_logging, get_logger

configure_logging()
logger = get_logger(__name__)

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


_APP_ERROR_STATUS_CODES = {
    NotFoundError: 404,
    ConflictError: 409,
    UnauthorizedError: 401,
    ForbiddenError: 403,
}


@app.exception_handler(AppError)
async def app_error_handler(request, exc: AppError):
    status_code = _APP_ERROR_STATUS_CODES.get(type(exc), 400)
    logger.warning("AppError on %s %s: %s", request.method, request.url.path, exc.message)
    return JSONResponse(status_code=status_code, content={"detail": exc.message})


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok"}


app.include_router(api_router, prefix=settings.API_V1_PREFIX)
