import uuid
from typing import Annotated, Literal, Union

from pydantic import BaseModel, EmailStr, Field, model_validator

from app.core.constants import AccountStatus, UserRole


# Common signup fields
class SignupBase(BaseModel):
    full_name: str = Field(min_length=1, max_length=150)
    email: EmailStr
    mobile_number: str = Field(min_length=10, max_length=20)
    password: str = Field(min_length=8, max_length=72)
    confirm_password: str = Field(min_length=8, max_length=72)

    @model_validator(mode="after")
    def check_password(self):
        if self.password != self.confirm_password:
            raise ValueError("Password and confirm password do not match.")
        return self


# Farmer signup fields
class FarmerSignupRequest(SignupBase):
    role: Literal[UserRole.FARMER]
    village: str | None = Field(default=None, max_length=150)
    pincode: str | None = Field(default=None, max_length=10)


# Doctor signup fields
class DoctorSignupRequest(SignupBase):
    role: Literal[UserRole.DOCTOR]
    qualification: str | None = Field(default=None, max_length=255)
    specialization: str | None = Field(default=None, max_length=255)
    registration_number: str | None = Field(default=None, max_length=100)
    experience_years: int | None = Field(default=None, ge=0)


# Only Farmer and Doctor can signup publicly
SignupRequest = Annotated[
    Union[FarmerSignupRequest, DoctorSignupRequest],
    Field(discriminator="role")
]


# Login request
class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


class PanelLoginRequest(LoginRequest):
    role: UserRole


class DoctorRegistrationStatusResponse(BaseModel):
    account_status: AccountStatus
    is_verified: bool
    message: str


# User details
class UserResponse(BaseModel):
    id: uuid.UUID
    role: UserRole
    full_name: str | None
    email: str | None
    mobile_number: str

    model_config = {"from_attributes": True}


# Signup response
class SignupResponse(BaseModel):
    message: str
    user: UserResponse


# Login response
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Update profile
class UpdateProfileRequest(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=150)
    email: EmailStr | None = None
    mobile_number: str | None = Field(default=None, min_length=10, max_length=20)


# Change password
class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=72)
    new_password: str = Field(min_length=8, max_length=72)
    confirm_new_password: str = Field(min_length=8, max_length=72)

    @model_validator(mode="after")
    def check_password(self):
        if self.new_password != self.confirm_new_password:
            raise ValueError("New passwords do not match.")

        if self.new_password == self.current_password:
            raise ValueError("New password must be different.")

        return self