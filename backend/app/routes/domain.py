import uuid
import logging
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from app.database import get_database
from app.models.domain import PatientProfile, ActiveVisit, MedicationLog

router = APIRouter(tags=["Domain Operations"])
logger = logging.getLogger("silvercare.routes.domain")

@router.post("/patient/profile", response_model=Dict[str, Any])
async def save_patient_profile(profile: PatientProfile):
    db = get_database()
    existing = await db["patients"].find_one({"patient_id": profile.user_id})
    profile_data = profile.model_dump()
    profile_data["patient_id"] = profile.user_id
    
    if existing:
        await db["patients"].update_one({"patient_id": profile.user_id}, {"$set": profile_data})
    else:
        profile_data["_id"] = str(uuid.uuid4())
        await db["patients"].insert_one(profile_data)
        
    return {"status": "success", "message": "Patient profile successfully synchronized in database."}

@router.get("/patient/profile/{user_id}", response_model=Dict[str, Any])
async def get_patient_profile(user_id: str):
    db = get_database()
    profile = await db["patients"].find_one({"patient_id": user_id})
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found in database"
        )
    if "_id" in profile:
        profile["id"] = str(profile.pop("_id"))
    return profile

@router.get("/visit/queue/{patient_id}", response_model=Dict[str, Any])
async def get_visit_queue(patient_id: str):
    db = get_database()
    visit = await db["visits"].find_one({"patient_id": patient_id})
    if not visit:
        return {
            "patient_id": patient_id,
            "ticket_number": 45,
            "current_serving_number": 42,
            "predicted_wait_time_minutes": 12,
            "doctor_name": "Dr. Rajesh",
            "room_number": "Rm 402"
        }
    if "_id" in visit:
        visit["id"] = str(visit.pop("_id"))
    return visit

@router.post("/visit/record", response_model=Dict[str, Any])
async def save_visit_record(visit: ActiveVisit):
    db = get_database()
    visit_data = visit.model_dump()
    existing = await db["visits"].find_one({"patient_id": visit.patient_id})
    
    if existing:
        await db["visits"].update_one({"patient_id": visit.patient_id}, {"$set": visit_data})
    else:
        visit_data["_id"] = str(uuid.uuid4())
        await db["visits"].insert_one(visit_data)
        
    return {"status": "success", "message": "Clinical visit record synchronized successfully."}

@router.post("/compliance/log", response_model=Dict[str, Any])
async def save_compliance_log(log: MedicationLog):
    db = get_database()
    log_data = log.model_dump()
    
    filter_query = {
        "patient_id": log.patient_id,
        "date": log.date,
        "medication_name": log.medication_name,
        "schedule": log.schedule
    }
    
    existing = await db["compliance_logs"].find_one(filter_query)
    if existing:
        await db["compliance_logs"].update_one(filter_query, {"$set": {"status": log.status}})
    else:
        log_data["_id"] = str(uuid.uuid4())
        await db["compliance_logs"].insert_one(log_data)
        
    return {"status": "success", "message": "Medication compliance log recorded successfully."}
