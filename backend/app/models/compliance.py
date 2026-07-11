from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
from app.models.medicine import TimeSlot

class ComplianceStatus(str, Enum):
    COMPLETED = "completed"
    MISSED = "missed"
    PENDING = "pending"

class ComplianceLogBase(BaseModel):
    patient_id: str
    medicine_id: str
    scheduled_time_slot: TimeSlot
    date: str = Field(description="Date in YYYY-MM-DD format")
    status: ComplianceStatus
    logged_at: Optional[datetime] = None

class ComplianceLogCreate(BaseModel):
    patient_id: str
    medicine_id: str
    scheduled_time_slot: TimeSlot
    status: ComplianceStatus

class ComplianceLogResponse(ComplianceLogBase):
    id: str = Field(alias="_id")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "id": "log_id_789",
                "patient_id": "patient_uuid_456",
                "medicine_id": "med_id_001",
                "scheduled_time_slot": "Morning",
                "date": "2026-07-11",
                "status": "completed",
                "logged_at": "2026-07-11T08:15:30.123456"
            }
        }
    }

class ComplianceStats(BaseModel):
    patient_id: str
    total_scheduled: int
    completed_count: int
    missed_count: int
    compliance_rate: float = Field(description="Percentage of completed medications out of total logged")
