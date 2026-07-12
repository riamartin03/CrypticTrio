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

class MedicationDetail(BaseModel):
    name: str
    dosage: str
    schedule: str = Field(description="Morning or Night")
    image_url: Optional[str] = None
    restock_date: Optional[str] = None

class PatientProfileBase(BaseModel):
    user_id: str = Field(alias="patient_id")
    nickname: Optional[str] = Field(default=None, alias="preferred_name")
    phone_no: Optional[str] = Field(default=None, alias="phone")
    dob: Optional[str] = Field(default=None, alias="date_of_birth")
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    
    # Medical Snapshot
    primary_medical_conditions: List[str] = Field(default_factory=list, alias="primary_conditions")
    mental_and_cognitive_disabilities: List[str] = Field(default_factory=list, alias="mental_disabilities")
    known_allergies_and_drug_reactions: List[str] = Field(default_factory=list, alias="allergies")
    
    # Master Medications Array
    medications: List[MedicationDetail] = Field(default_factory=list)
    
    # Care Network
    primary_care_physician_name: Optional[str] = Field(default=None, alias="physician_name")
    clinic_phone_no: Optional[str] = Field(default=None, alias="clinic_phone")
    primary_caretaker_name: Optional[str] = None
    caretaker_phone_no: Optional[str] = None
    caretaker_email: Optional[str] = None
    relation_to_caretaker: Optional[str] = None
    
    # Address Core
    full_street_address: Optional[str] = None
    city: Optional[str] = None
    state_province: Optional[str] = None
    postal_zip_code: Optional[str] = None
    country: Optional[str] = None
    gps_coordinates: Optional[str] = None
    
    # Legacy fallbacks for compatibility
    emergency_contacts: List[EmergencyContact] = Field(default_factory=list)
    home_address: Optional[HomeAddress] = None
    medical_history: List[str] = Field(default_factory=list)
    physical_disabilities: List[str] = Field(default_factory=list)
    lifetime_medications: Optional[str] = None

    model_config = {
        "populate_by_name": True
    }

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
                "preferred_name": "Ramesh",
                "phone": "+15550199",
                "date_of_birth": "1954-05-12",
                "gender": "Male",
                "blood_group": "O+",
                "primary_conditions": ["Hypertension"],
                "mental_disabilities": ["Dementia"],
                "allergies": ["Penicillin"],
                "medications": [
                    {"name": "Lisinopril", "dosage": "10mg", "schedule": "Morning", "image_url": None, "restock_date": "2026-08-01"}
                ],
                "physician_name": "Dr. Emily",
                "clinic_phone": "555-0210"
            }
        }
    }
