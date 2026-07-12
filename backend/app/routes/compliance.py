import uuid
import logging
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from datetime import datetime
from app.database import get_database
from app.models.schemas import MedicationLog

router = APIRouter(prefix="/compliance", tags=["Compliance"])
logger = logging.getLogger("silvercare.routes.compliance")

class ToggleComplianceRequest(BaseModel):
    patient_id: str
    date: str
    medication_id: str
    time_slot: str
    status: str  # "taken" or "pending"

@router.get("/calendar/{patient_id}", response_model=List[MedicationLog])
async def get_compliance_calendar(patient_id: str, date: str):
    db = get_database()
    cursor = db["compliance_logs"].find({"patient_id": patient_id, "date": date})
    logs = []
    async for doc in cursor:
        logs.append(MedicationLog(
            patient_id=doc.get("patient_id") or patient_id,
            date=doc.get("date") or date,
            medication_id=doc.get("medication_id") or doc.get("medicine_id") or "",
            medication_name=doc.get("medication_name") or doc.get("medicine_name") or "",
            time_slot=doc.get("time_slot") or doc.get("scheduled_time_slot") or "Morning",
            status=doc.get("status") or "pending",
            updated_at=str(doc.get("updated_at") or doc.get("logged_at") or datetime.utcnow().isoformat())
        ))
    return logs

@router.patch("/toggle", response_model=Dict[str, Any])
async def toggle_medication_compliance(req: ToggleComplianceRequest):
    db = get_database()
    filter_query = {
        "patient_id": req.patient_id,
        "date": req.date,
        "medication_id": req.medication_id,
        "time_slot": req.time_slot
    }
    
    existing = await db["compliance_logs"].find_one(filter_query)
    updated_at_str = datetime.utcnow().isoformat()
    
    if existing:
        await db["compliance_logs"].update_one(
            filter_query,
            {"$set": {"status": req.status, "updated_at": updated_at_str}}
        )
    else:
        med = await db["medicines"].find_one({"_id": req.medication_id})
        med_name = med.get("name") if med else "Prescription Medicine"
        
        log_doc = {
            "_id": str(uuid.uuid4()),
            "patient_id": req.patient_id,
            "date": req.date,
            "medication_id": req.medication_id,
            "medication_name": med_name,
            "time_slot": req.time_slot,
            "status": req.status,
            "updated_at": updated_at_str
        }
        await db["compliance_logs"].insert_one(log_doc)
        
    return {"status": "success", "message": "Medication compliance status updated successfully."}
