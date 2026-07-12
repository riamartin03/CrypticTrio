from typing import Optional
from pydantic import BaseModel, Field

class ClinicalVisitBase(BaseModel):
    patient_id: str
    
    # Active Queue States
    ticket_number: int
    current_serving_number: int
    predicted_wait_time_minutes: int
    
    # Consultation Data
    doctor_name: str
    room_number: str
    raw_audio_url: Optional[str] = None
    ai_consultation_summary: str
    next_appointment_date: Optional[str] = None

    model_config = {
        "populate_by_name": True
    }

class ClinicalVisitCreate(ClinicalVisitBase):
    pass

class ClinicalVisitResponse(ClinicalVisitBase):
    id: str = Field(alias="_id")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "id": "visit_uuid_111",
                "patient_id": "patient_uuid_456",
                "ticket_number": 45,
                "current_serving_number": 42,
                "predicted_wait_time_minutes": 15,
                "doctor_name": "Dr. Emily Vance",
                "room_number": "Rm 402",
                "raw_audio_url": None,
                "ai_consultation_summary": "Patient is responding well to blood pressure control adjustments.",
                "next_appointment_date": "2026-07-24"
            }
        }
    }
