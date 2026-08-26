import uuid
from typing import Annotated, Literal, Union

from pydantic import BaseModel, EmailStr, Field, model_validator

from app.core.constants import UserRole


class _SignupBase(BaseModel):
    full_name: str = Field(min_length=1, max_length=150)
    email: EmailStr
    mobile_number: str = Field(min_length=10, max_length=20)
    password: str = Field(min_length=8, max_length=72)
    confirm_password: str = Field(min_length=8, max_length=72)

    @model_validator(mode="after")
    def passwords_match(self) -> "_SignupBase":
        if self.password != self.confirm_password:
            raise ValueError("Password and confirm password do not match.")
        return self


class FarmerSignupRequest(_SignupBase):
    role: Literal[UserRole.FARMER]
    village: str | None = Field(default=None, max_length=150)
    pincode: str | None = Field(default=None, max_length=10)


class DoctorSignupRequest(_SignupBase):
    role: Literal[UserRole.DOCTOR]
    qualification: str | None = Field(default=None, max_length=255)
    specialization: str | None = Field(default=None, max_length=255)
    registration_number: str | None = Field(default=None, max_length=100)
    experience_years: int | None = Field(default=None, ge=0)


SignupRequest = Annotated[
    Union[FarmerSignupRequest, DoctorSignupRequest], Field(discriminator="role")
]


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


class UpdateProfileRequest(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=150)
    email: EmailStr | None = None
    mobile_number: str | None = Field(default=None, min_length=10, max_length=20)


class UserResponse(BaseModel):
    id: uuid.UUID
    role: UserRole
    full_name: str | None
    email: str | None
    mobile_number: str

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
