from functools import lru_cache
from urllib.parse import urlsplit, urlunsplit

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Smart Dairy Manager API"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    CORS_ORIGINS: str = "http://localhost:5173"

    ADMIN_EMAIL: str = "admin@gauvikas.com"
    ADMIN_PASSWORD: str | None = None
    ADMIN_MOBILE_NUMBER: str = "0000000000"

    @field_validator("DEBUG", mode="before")
    @classmethod
    def normalize_debug_setting(cls, value):
        # Some deployment environments expose their mode through DEBUG instead
        # of APP_ENV. Accept those common mode labels so settings can still load.
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"release", "production", "prod"}:
                return False
            if normalized in {"development", "dev", "debug"}:
                return True
        return value

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins_list(self) -> list[str]:
        origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        if self.APP_ENV.strip().lower() in {"development", "dev", "local"}:
            for origin in tuple(origins):
                parsed = urlsplit(origin)
                if parsed.hostname == "localhost":
                    alias = parsed.netloc.replace("localhost", "127.0.0.1", 1)
                    origins.append(urlunsplit(parsed._replace(netloc=alias)))
                elif parsed.hostname == "127.0.0.1":
                    alias = parsed.netloc.replace("127.0.0.1", "localhost", 1)
                    origins.append(urlunsplit(parsed._replace(netloc=alias)))
        return list(dict.fromkeys(origins))


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
