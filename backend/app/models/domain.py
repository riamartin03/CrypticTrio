from typing import List, Optional
from pydantic import BaseModel, Field

class MedicationDetail(BaseModel):
    name: str
    dosage: str
    schedule: str  # "Morning" / "Night"
    image_url: Optional[str] = None
    restock_date: Optional[str] = None

class PatientProfile(BaseModel):
    user_id: str
    nickname: Optional[str] = None
    phone_no: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    
    primary_medical_conditions: List[str] = Field(default_factory=list)
    mental_and_cognitive_disabilities: List[str] = Field(default_factory=list)
    known_allergies_and_drug_reactions: List[str] = Field(default_factory=list)
    
    primary_care_physician_name: Optional[str] = None
    clinic_phone_no: Optional[str] = None
    primary_caretaker_name: Optional[str] = None
    caretaker_phone_no: Optional[str] = None
    caretaker_email: Optional[str] = None
    relation_to_caretaker: Optional[str] = None
    
    full_street_address: Optional[str] = None
    city: Optional[str] = None
    state_province: Optional[str] = None
    postal_zip_code: Optional[str] = None
    country: Optional[str] = None
    gps_coordinates: Optional[str] = None
    
    medications: List[MedicationDetail] = Field(default_factory=list)

class ActiveVisit(BaseModel):
    patient_id: str
    ticket_number: int
    current_serving_number: int
    predicted_wait_time_minutes: int
    doctor_name: str
    room_number: str
    ai_consultation_summary: str
    next_appointment_date: Optional[str] = None

class MedicationLog(BaseModel):
    patient_id: str
    date: str
    medication_name: str
    schedule: str  # "Morning"/"Night"
    status: str  # "pending"/"taken"/"missed"
