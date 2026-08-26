"""Imports every ORM model so Base.metadata is fully populated.

Used by Alembic autogenerate and dev tooling (e.g. Base.metadata.create_all()).
Nothing in the normal app runtime should import this module — routers/services
only need the specific model(s) they work with, imported directly.
"""

from app.modules.animals.model import Animal, AnimalLifecycleHistory, AnimalPanHistory  # noqa: F401
from app.modules.breeding.model import BreedingRecord  # noqa: F401
from app.modules.doctor_requests.model import DoctorRequest  # noqa: F401
from app.modules.doctors.model import DoctorProfile  # noqa: F401
from app.modules.farmers.model import FarmerProfile  # noqa: F401
from app.modules.farms.model import Farm  # noqa: F401
from app.modules.feed.model import FeedRecord, FeedType  # noqa: F401
from app.modules.health.model import HealthRecord  # noqa: F401
from app.modules.mastitis.model import MastitisRecord  # noqa: F401
from app.modules.milk.model import MilkRecord  # noqa: F401
from app.modules.pans.model import Pan  # noqa: F401
from app.modules.users.model import User  # noqa: F401
