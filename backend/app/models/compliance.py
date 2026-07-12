from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, model_validator
from app.models.medicine import TimeSlot

class ComplianceStatus(str, Enum):
    TAKEN = "taken"
    COMPLETED = "completed"  # Compatible fallback
    MISSED = "missed"
    PENDING = "pending"

class ComplianceLogBase(BaseModel):
    patient_id: str
    medicine_id: str
    medication_name: str
    scheduled_time_slot: TimeSlot
    scheduled_time: str
    date: str = Field(description="Date in YYYY-MM-DD format")
    status: ComplianceStatus
    logged_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @model_validator(mode='before')
    @classmethod
    def sync_fields(cls, data: any) -> any:
        if isinstance(data, dict):
            # Sync medicine_id <-> medication_name
            med_id = data.get("medicine_id") or data.get("medication_name")
            if med_id:
                data["medicine_id"] = med_id
                data["medication_name"] = med_id
            
            # Sync scheduled_time_slot <-> scheduled_time
            time_slot = data.get("scheduled_time_slot") or data.get("scheduled_time")
            if time_slot:
                data["scheduled_time_slot"] = time_slot
                data["scheduled_time"] = str(time_slot)
            
            # Sync logged_at <-> updated_at
            tstamp = data.get("logged_at") or data.get("updated_at")
            if tstamp:
                data["logged_at"] = tstamp
                data["updated_at"] = tstamp
        return data

    model_config = {
        "populate_by_name": True
    }

class ComplianceLogCreate(BaseModel):
    patient_id: str
    medicine_id: str
    medication_name: str
    scheduled_time_slot: TimeSlot
    scheduled_time: str
    status: ComplianceStatus

    @model_validator(mode='before')
    @classmethod
    def sync_fields(cls, data: any) -> any:
        if isinstance(data, dict):
            med_id = data.get("medicine_id") or data.get("medication_name")
            if med_id:
                data["medicine_id"] = med_id
                data["medication_name"] = med_id
            
            time_slot = data.get("scheduled_time_slot") or data.get("scheduled_time")
            if time_slot:
                data["scheduled_time_slot"] = time_slot
                data["scheduled_time"] = str(time_slot)
        return data

    model_config = {
        "populate_by_name": True
    }

class ComplianceLogResponse(ComplianceLogBase):
    id: str = Field(alias="_id")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "id": "log_id_789",
                "patient_id": "patient_uuid_456",
                "medication_name": "Lisinopril 10mg",
                "scheduled_time": "Morning",
                "date": "2026-07-12",
                "status": "taken",
                "updated_at": "2026-07-12T08:15:30Z"
            }
        }
    }

class ComplianceStats(BaseModel):
    patient_id: str
    total_scheduled: int
    completed_count: int
    missed_count: int
    compliance_rate: float
