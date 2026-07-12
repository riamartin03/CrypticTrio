from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class PersonalInfo(BaseModel):
    nickname: Optional[str] = None
    phone_no: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    full_street_address: Optional[str] = None
    city: Optional[str] = None
    gps_coordinates: Optional[str] = None

class MedicalRecords(BaseModel):
    blood_group: Optional[str] = None
    primary_medical_conditions: List[str] = Field(default_factory=list)
    mental_and_cognitive_disabilities: List[str] = Field(default_factory=list)
    known_allergies_and_drug_reactions: List[str] = Field(default_factory=list)

class CareNetwork(BaseModel):
    primary_care_physician_name: Optional[str] = None
    clinic_phone_no: Optional[str] = None
    primary_caretaker_name: Optional[str] = None
    caretaker_phone_no: Optional[str] = None
    caretaker_email: Optional[str] = None

class MedicationDetail(BaseModel):
    medication_id: str
    name: str
    dosage: str
    schedule: List[str] = Field(default_factory=list)  # e.g. ["Morning", "Night"]
    image_url: Optional[str] = None
    restock_date: Optional[str] = None

class PatientProfileResponse(BaseModel):
    user_id: str
    personal_info: PersonalInfo
    medical_records: MedicalRecords
    care_network: CareNetwork
    master_medications: List[MedicationDetail] = Field(default_factory=list)

class LiveQueue(BaseModel):
    ticket_number: int
    current_serving_number: int
    predicted_wait_time_minutes: int
    status: str

class VisitDetails(BaseModel):
    patient_id: str
    doctor_name: str
    clinic_name: str
    appointment_date: str
    live_queue: LiveQueue
    before_visit: Dict[str, Any] = Field(default_factory=dict)
    during_visit: Dict[str, Any] = Field(default_factory=dict)
    next_appointment_date: Optional[str] = None

class MedicationLog(BaseModel):
    patient_id: str
    date: str
    medication_id: str
    medication_name: str
    time_slot: str
    status: str
    updated_at: str
