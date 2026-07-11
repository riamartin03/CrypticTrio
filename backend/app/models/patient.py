from typing import List, Optional
from pydantic import BaseModel, Field

class EmergencyContact(BaseModel):
    name: str
    phone: str
    relationship: str
    email: Optional[str] = None

class HomeAddress(BaseModel):
    address_text: str
    latitude: float
    longitude: float
    street: Optional[str] = None
    unit: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None

class PatientProfileBase(BaseModel):
    patient_id: str
    preferred_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    primary_conditions: List[str] = Field(default_factory=list)
    mental_disabilities: List[str] = Field(default_factory=list)
    physical_disabilities: List[str] = Field(default_factory=list)
    lifetime_medications: Optional[str] = None
    physician_name: Optional[str] = None
    clinic_phone: Optional[str] = None
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
