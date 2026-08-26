class AppError(Exception):
    """Base class for application-specific errors."""

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class NotFoundError(AppError):
    """Raised when a requested resource does not exist."""


class ConflictError(AppError):
    """Raised when a request conflicts with existing state (e.g. duplicate unique value)."""


class UnauthorizedError(AppError):
    """Raised when authentication is missing or invalid."""


class ForbiddenError(AppError):
    """Raised when the authenticated user lacks permission for the action."""
