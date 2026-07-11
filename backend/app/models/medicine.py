from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

class TimeSlot(str, Enum):
    MORNING = "Morning"
    AFTERNOON = "Afternoon"
    EVENING = "Evening"
    NIGHT = "Night"

class VisualIdentifiers(BaseModel):
    shape: str = Field(description="e.g. Oval, Round, Capsule")
    color: str = Field(description="e.g. Blue, White, Red with yellow stripe")

class MedicineBase(BaseModel):
    patient_id: str
    name: str
    visual_identifiers: VisualIdentifiers
    image_url: Optional[str] = None
    scheduled_times: List[TimeSlot] = Field(default_factory=list, description="List of time slots when this should be taken")
    custom_instructions: Optional[str] = Field(None, description="e.g. Take with food, Do not crush")
    is_critical: bool = Field(default=False, description="Sends emergency alert to caregiver if missed")

class MedicineCreate(MedicineBase):
    pass

class MedicineResponse(MedicineBase):
    id: str = Field(alias="_id")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "id": "med_id_001",
                "patient_id": "patient_uuid_456",
                "name": "Metformin",
                "visual_identifiers": {
                    "shape": "Oval",
                    "color": "White"
                },
                "image_url": "https://example.com/images/metformin.jpg",
                "scheduled_times": ["Morning", "Evening"],
                "custom_instructions": "Take with dinner or breakfast",
                "is_critical": True
            }
        }
    }
