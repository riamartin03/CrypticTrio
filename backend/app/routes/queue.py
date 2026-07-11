import logging
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status
from app.database import get_database
from app.models.clinic import ClinicQueueState, ClinicAppointment

router = APIRouter(prefix="/queue", tags=["Clinic visit Queue"])
logger = logging.getLogger("silvercare.routes.queue")

DEFAULT_CLINIC_ID = "clinic_main"

async def get_or_create_queue(db) -> dict:
    """Helper to fetch or initialize the single global clinic queue document."""
    queue = await db["clinic_queues"].find_one({"clinic_id": DEFAULT_CLINIC_ID})
    if not queue:
        # Initialize default queue state
        queue = {
            "clinic_id": DEFAULT_CLINIC_ID,
            "current_ticket": 0,
            "appointments": []
        }
        await db["clinic_queues"].insert_one(queue)
    return queue

@router.get("/status", response_model=Dict[str, Any])
async def get_queue_status(patient_id: str):
    """
    Returns the live status of the clinic queue for a specific patient.
    Format: { current_number: X, user_number: Y, est_minutes_left: Z }
    """
    db = get_database()
    queue = await get_or_create_queue(db)
    
    current_ticket = queue.get("current_ticket", 0)
    appointments = queue.get("appointments", [])
    
    # Find user's appointment in the queue
    user_appt = None
    position = 0
    for idx, appt in enumerate(appointments):
        if appt.get("patient_id") == patient_id:
            user_appt = appt
            position = idx + 1
            break
            
    if not user_appt:
        # If user isn't in queue, return a default mock representation so the UI doesn't crash,
        # but specify they aren't currently waiting.
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient is not currently in the clinic visit queue. Use '/queue/add' to join."
        )
        
    # Calculate estimated minutes remaining: 5 minutes per patient in front
    est_wait = (position - 1) * 5
    
    return {
        "current_number": current_ticket,
        "user_number": user_appt.get("ticket_number"),
        "est_minutes_left": max(0, est_wait),
        "patient_id": patient_id,
        "position_in_queue": position
    }

# ==========================================
# SIMULATION & MANAGEMENT ENDPOINTS (HACKATHON PRESENTATION)
# ==========================================

@router.post("/add", status_code=status.HTTP_201_CREATED)
async def add_to_queue(patient_id: str):
    """
    Joins the clinic queue for a specific patient. Generates a ticket number.
    """
    db = get_database()
    queue = await get_or_create_queue(db)
    
    # Check if patient already in queue
    appointments = queue.get("appointments", [])
    for appt in appointments:
        if appt.get("patient_id") == patient_id:
            return {
                "message": "Patient already in queue",
                "ticket_number": appt.get("ticket_number"),
                "queue_state": queue
            }
            
    # Fetch patient user details for name
    user = await db["users"].find_one({"_id": patient_id})
    patient_name = user.get("name", "Unknown Patient") if user else "Unknown Patient"
    
    # Get highest ticket number
    highest_ticket = queue.get("current_ticket", 0)
    if appointments:
        highest_ticket = max(appt.get("ticket_number") for appt in appointments)
        
    new_ticket = highest_ticket + 1
    
    # 5 mins per person currently in queue
    wait_time = len(appointments) * 5
    
    new_appt = {
        "patient_id": patient_id,
        "patient_name": patient_name,
        "ticket_number": new_ticket,
        "est_wait_time_minutes": wait_time
    }
    
    await db["clinic_queues"].update_one(
        {"clinic_id": DEFAULT_CLINIC_ID},
        {"$push": {"appointments": new_appt}}
    )
    
    return {
        "message": "Successfully joined clinic queue",
        "ticket_number": new_ticket,
        "est_wait_time_minutes": wait_time
    }

@router.post("/advance")
async def advance_queue():
    """
    Simulates clinic workflow by advancing the queue:
    1. Increases current_ticket by 1.
    2. Removes the patient who was just called from the front of the queue list.
    3. Recalculates wait times.
    """
    db = get_database()
    queue = await get_or_create_queue(db)
    
    current_ticket = queue.get("current_ticket", 0)
    appointments = queue.get("appointments", [])
    
    if not appointments:
        # If no appointments, just bump the current ticket for mock presentation purposes
        next_ticket = current_ticket + 1
        await db["clinic_queues"].update_one(
            {"clinic_id": DEFAULT_CLINIC_ID},
            {"$set": {"current_ticket": next_ticket}}
        )
        return {
            "message": "Queue was empty. Current ticket advanced anyway.",
            "current_ticket": next_ticket,
            "appointments_left": 0
        }
        
    # Remove first appointment (called)
    called_patient = appointments.pop(0)
    next_ticket = called_patient["ticket_number"]
    
    # Recalculate remaining wait times
    for idx, appt in enumerate(appointments):
        appt["est_wait_time_minutes"] = idx * 5
        
    await db["clinic_queues"].update_one(
        {"clinic_id": DEFAULT_CLINIC_ID},
        {"$set": {
            "current_ticket": next_ticket,
            "appointments": appointments
        }}
    )
    
    return {
        "message": f"Advanced queue. Called ticket #{next_ticket} ({called_patient.get('patient_name')})",
        "current_ticket": next_ticket,
        "remaining_appointments_count": len(appointments),
        "called_patient": called_patient
    }

@router.post("/reset")
async def reset_queue():
    """
    Resets the clinic queue to default initial state.
    """
    db = get_database()
    await db["clinic_queues"].update_one(
        {"clinic_id": DEFAULT_CLINIC_ID},
        {"$set": {
            "current_ticket": 0,
            "appointments": []
        }},
        upsert=True
    )
    return {"message": "Clinic queue has been reset to ticket 0."}
