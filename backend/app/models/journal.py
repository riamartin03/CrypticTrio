from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class JournalBase(BaseModel):
    patient_id: str
    audio_file_url: Optional[str] = None
    transcript: str
    summary: Optional[str] = Field(None, description="Doctor Brief containing Symptoms, Timeline, and Key Points")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class JournalCreate(BaseModel):
    patient_id: str
    transcript: str
    summary: Optional[str] = None

class JournalResponse(JournalBase):
    id: str = Field(alias="_id")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "id": "journal_id_555",
                "patient_id": "patient_uuid_456",
                "audio_file_url": "/uploads/audio/dizzy_morning.wav",
                "transcript": "I felt dizzy around nine am. It passed after drinking water, but my head still feels heavy.",
                "summary": "### Doctor Brief\n- **Symptoms**: Dizziness, heavy head\n- **Timeline**: 9:00 AM\n- **Key Points**: Dizziness resolved after hydration; mild headache persists.",
                "created_at": "2026-07-11T12:00:00"
            }
        }
    }
