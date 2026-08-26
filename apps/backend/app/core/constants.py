import enum


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    FARMER = "FARMER"
    DOCTOR = "DOCTOR"


class AccountStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"


class Gender(str, enum.Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"


class AnimalStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    SOLD = "SOLD"
    DECEASED = "DECEASED"


class PregnancyStatus(str, enum.Enum):
    NOT_PREGNANT = "NOT_PREGNANT"
    PREGNANT = "PREGNANT"
    UNKNOWN = "UNKNOWN"


class RequestStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"
