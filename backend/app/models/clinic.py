from typing import List
from pydantic import BaseModel, Field

class ClinicAppointment(BaseModel):
    patient_id: str
    patient_name: str
    ticket_number: int
    est_wait_time_minutes: int

class ClinicQueueState(BaseModel):
    clinic_id: str = Field(default="clinic_main")
    current_ticket: int = Field(default=0, description="The ticket number currently being called")
    appointments: List[ClinicAppointment] = Field(default_factory=list)

class QueueStatusResponse(BaseModel):
    current_number: int = Field(..., description="Currently served ticket")
    user_number: int = Field(..., description="User's ticket number")
    est_minutes_left: int = Field(..., description="Estimated wait time remaining")
    patient_id: str
    position_in_queue: int
