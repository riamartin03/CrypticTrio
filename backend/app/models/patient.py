from typing import List, Optional
from pydantic import BaseModel, Field

class EmergencyContact(BaseModel):
    name: str
    phone: str
    relationship: str

class HomeAddress(BaseModel):
    address_text: str
    latitude: float
    longitude: float

class PatientProfileBase(BaseModel):
    patient_id: str
    emergency_contacts: List[EmergencyContact] = Field(default_factory=list)
    medical_history: List[str] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list)
    home_address: Optional[HomeAddress] = None

class PatientProfileCreate(PatientProfileBase):
    pass

class PatientProfileResponse(PatientProfileBase):
    id: str = Field(alias="_id")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "id": "profile_id_123",
                "patient_id": "patient_uuid_456",
                "emergency_contacts": [
                    {"name": "Sarah Smith", "phone": "+15550199", "relationship": "Daughter"}
                ],
                "medical_history": ["Hypertension", "Type 2 Diabetes"],
                "allergies": ["Penicillin", "Peanuts"],
                "home_address": {
                    "address_text": "123 Sunny Meadows Lane, San Jose, CA",
                    "latitude": 37.3382,
                    "longitude": -121.8863
                }
            }
        }
    }
