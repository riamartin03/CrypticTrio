import uuid
import logging
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.database import get_database
from app.models.schemas import VisitDetails

router = APIRouter(prefix="/visits", tags=["Visits"])
logger = logging.getLogger("silvercare.routes.visits")

class AudioSummaryRequest(BaseModel):
    patient_id: str
    ai_consultation_summary: str
    extracted_prescription_notes: str

class AppointmentModel(BaseModel):
    patient_id: str
    title: str
    doctor: str
    date: str
    time: str
    location: str

@router.get("/active/{patient_id}", response_model=VisitDetails)
async def get_active_visit(patient_id: str):
    db = get_database()
    visit = await db["visits"].find_one({"patient_id": patient_id})
    if not visit:
        return VisitDetails(
            patient_id=patient_id,
            doctor_name="Dr. Rajesh",
            clinic_name="St. Jude General",
            appointment_date="2026-07-18",
            live_queue={
                "ticket_number": 45,
                "current_serving_number": 42,
                "predicted_wait_time_minutes": 15,
                "status": "waiting"
            },
            before_visit={
                "reason": "Routine checkup and blood pressure review.",
                "symptoms": ["Mild morning dizziness"]
            },
            during_visit={
                "ai_consultation_summary": "Consultation pending.",
                "extracted_prescription_notes": "None"
            },
            next_appointment_date="2026-07-24"
        )
    return VisitDetails(
        patient_id=visit.get("patient_id") or patient_id,
        doctor_name=visit.get("doctor_name") or "Dr. Rajesh",
        clinic_name=visit.get("clinic_name") or "St. Jude General",
        appointment_date=visit.get("appointment_date") or "2026-07-18",
        live_queue=visit.get("live_queue") or {
            "ticket_number": visit.get("ticket_number") or 45,
            "current_serving_number": visit.get("current_serving_number") or 42,
            "predicted_wait_time_minutes": visit.get("predicted_wait_time_minutes") or 15,
            "status": "waiting"
        },
        before_visit=visit.get("before_visit") or {},
        during_visit=visit.get("during_visit") or {
            "ai_consultation_summary": visit.get("ai_consultation_summary") or "Consultation pending.",
            "extracted_prescription_notes": visit.get("extracted_prescription_notes") or "None"
        },
        next_appointment_date=visit.get("next_appointment_date")
    )

@router.post("/audio-summary", response_model=Dict[str, Any])
async def save_audio_summary(req: AudioSummaryRequest):
    db = get_database()
    existing = await db["visits"].find_one({"patient_id": req.patient_id})
    
    during_visit_update = {
        "ai_consultation_summary": req.ai_consultation_summary,
        "extracted_prescription_notes": req.extracted_prescription_notes
    }
    
    if existing:
        await db["visits"].update_one(
            {"patient_id": req.patient_id},
            {"$set": {"during_visit": during_visit_update}}
        )
    else:
        visit_doc = {
            "_id": str(uuid.uuid4()),
            "patient_id": req.patient_id,
            "doctor_name": "Dr. Rajesh",
            "clinic_name": "St. Jude General",
            "appointment_date": "2026-07-18",
            "live_queue": {
                "ticket_number": 45,
                "current_serving_number": 42,
                "predicted_wait_time_minutes": 15,
                "status": "waiting"
            },
            "before_visit": {
                "reason": "Blood pressure review",
                "symptoms": ["Mild dizziness"]
            },
            "during_visit": during_visit_update,
            "next_appointment_date": "2026-07-24"
        }
        await db["visits"].insert_one(visit_doc)
        
    return {"status": "success", "message": "AI audio summaries updated in dynamic visit records."}

@router.get("/appointments/{patient_id}", response_model=List[Dict[str, Any]])
async def get_appointments(patient_id: str):
    db = get_database()
    cursor = db["appointments"].find({"patient_id": patient_id})
    appts = []
    async for doc in cursor:
        doc["id"] = str(doc.get("_id"))
        appts.append(doc)
    return appts

@router.post("/appointments", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_appointment(appt: AppointmentModel):
    db = get_database()
    appt_doc = appt.model_dump()
    appt_doc["_id"] = str(uuid.uuid4())
    await db["appointments"].insert_one(appt_doc)
    return {"status": "success", "message": "Appointment created successfully.", "id": appt_doc["_id"]}
