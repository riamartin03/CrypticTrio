import uuid
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from app.database import get_database
from app.models.medicine import MedicineCreate, MedicineResponse
from app.models.compliance import ComplianceLogCreate, ComplianceLogResponse, ComplianceStatus
from app.services.notification import trigger_caregiver_alert
from app.routes.auth import get_current_user

router = APIRouter(prefix="/scheduler", tags=["Medication Scheduler & Compliance"])
logger = logging.getLogger("silvercare.routes.scheduler")

@router.get("/medicines", response_model=List[Dict[str, Any]])
async def get_medicines(patient_id: str):
    """
    Retrieves the medication schedule for a patient.
    """
    db = get_database()
    medicines = await db["medicines"].find({"patient_id": patient_id}).to_list(length=100)
    for m in medicines:
        if "_id" in m:
            m["id"] = str(m.pop("_id"))
    return medicines

@router.post("/medicines", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_medicine(med_in: MedicineCreate):
    """
    Creates or updates a medication routine.
    """
    db = get_database()
    
    # Check if patient exists
    patient = await db["users"].find_one({"_id": med_in.patient_id})
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
        
    med_id = str(uuid.uuid4())
    med_doc = med_in.model_dump()
    med_doc["_id"] = med_id
    
    await db["medicines"].insert_one(med_doc)
    if "_id" in med_doc:
        med_doc["id"] = str(med_doc.pop("_id"))
        
    return {
        "message": "Medication schedule created successfully",
        "medicine_id": med_id,
        "medicine": med_doc
    }

async def check_and_alert_if_missed(patient_id: str, medicine_id: str, time_slot: str):
    """
    Simulates the background worker check. If after 30 minutes (simulated)
    no completed intake has been logged, trigger caregiver alert.
    """
    logger.info(f"Background check triggered for Patient {patient_id}, Medicine {medicine_id}, Time {time_slot}")
    db = get_database()
    
    today_date = datetime.utcnow().strftime("%Y-%m-%d")
    
    # Check compliance logs for this medicine on this day and time slot
    log = await db["compliance_logs"].find_one({
        "patient_id": patient_id,
        "medicine_id": medicine_id,
        "scheduled_time_slot": time_slot,
        "date": today_date
    })
    
    # If no log found, or if the log is marked missed or pending
    if not log or log.get("status") in [ComplianceStatus.MISSED.value, ComplianceStatus.PENDING.value]:
        # Fetch medicine details to check if it's critical
        med = await db["medicines"].find_one({"_id": medicine_id})
        if med and med.get("is_critical", False):
            logger.warning(f"Critical medication {med.get('name')} went unverified! Activating caregiver alert.")
            await trigger_caregiver_alert(patient_id, medicine_id, time_slot)
        else:
            logger.info("Missed medication was not marked critical. No caregiver alert fired.")
    else:
        logger.info(f"Medication intake already completed. No alert needed.")

@router.post("/log-intake")
async def log_intake(log_in: ComplianceLogCreate, background_tasks: BackgroundTasks):
    """
    Logs patient check-offs.
    If a critical medication is marked missed (or left unverified 30 minutes past its window),
    fire a mock background task simulating SMS/Email alert to Caregiver.
    """
    db = get_database()
    
    # Check if medication exists
    med = await db["medicines"].find_one({"_id": log_in.medicine_id})
    if not med:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found"
        )
        
    today_date = datetime.utcnow().strftime("%Y-%m-%d")
    
    # Prepare update query
    filter_query = {
        "patient_id": log_in.patient_id,
        "medicine_id": log_in.medicine_id,
        "scheduled_time_slot": log_in.scheduled_time_slot.value,
        "date": today_date
    }
    
    update_doc = {
        "$set": {
            "status": log_in.status.value,
            "logged_at": datetime.utcnow().isoformat()
        }
    }
    
    # Upsert the daily compliance log
    await db["compliance_logs"].update_one(filter_query, update_doc, upsert=True)
    
    # Fetch current log to return
    logged_entry = await db["compliance_logs"].find_one(filter_query)
    if logged_entry and "_id" in logged_entry:
        logged_entry["id"] = str(logged_entry.pop("_id"))
        
    # Trigger background tasks based on critical flag
    if med.get("is_critical", False):
        if log_in.status == ComplianceStatus.MISSED:
            # Trigger alert immediately in background
            logger.info("Critical medication logged as MISSED. Queueing immediate caregiver alert.")
            background_tasks.add_task(
                trigger_caregiver_alert,
                log_in.patient_id,
                log_in.medicine_id,
                log_in.scheduled_time_slot.value
            )
        elif log_in.status == ComplianceStatus.PENDING:
            # Simulate checking in 30 minutes
            logger.info("Critical medication pending. Queueing verification check in 30 minutes.")
            background_tasks.add_task(
                check_and_alert_if_missed,
                log_in.patient_id,
                log_in.medicine_id,
                log_in.scheduled_time_slot.value
            )
            
    return {
        "message": "Intake status logged successfully",
        "log": logged_entry
    }

# ==========================================
# SIMULATION ENDPOINTS (HACKATHON PRESENTATION)
# ==========================================

@router.post("/simulate-missed-check")
async def simulate_missed_check(
    patient_id: str,
    medicine_id: str,
    time_slot: str,
    background_tasks: BackgroundTasks
):
    """
    Directly triggers the compliance check simulation, bypassing any delay timer.
    Useful for demonstrating the automated caregiver alert system during presentations.
    """
    logger.info("Simulation endpoint called to force check missed medication status")
    background_tasks.add_task(
        check_and_alert_if_missed,
        patient_id,
        medicine_id,
        time_slot
    )
    return {
        "status": "simulation_queued",
        "message": f"Checking medication intake check for patient {patient_id}, time slot {time_slot}."
    }
