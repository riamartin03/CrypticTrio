import logging
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, status, Depends
from app.database import get_database
from app.routes.auth import get_current_user
from app.routes.queue import get_queue_status

router = APIRouter(prefix="/caregiver", tags=["Caregiver Dashboard Monitoring"])
logger = logging.getLogger("silvercare.routes.caregiver")

@router.get("/dashboard", response_model=Dict[str, Any])
async def get_caregiver_dashboard(patient_id: str, current_user: dict = Depends(get_current_user)):
    """
    Aggregates real-time compliance statistics, patient records, medications,
    journal logs, and clinic queue statuses for the caregiver portal.
    """
    # 1. Authorize: Caregiver must be linked to the patient, or a patient can view their own summary.
    if current_user["role"] == "caregiver" and patient_id not in current_user.get("associated_user_ids", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Caregivers can only view dashboard data for their associated patients"
        )
    elif current_user["role"] == "patient" and current_user["_id"] != patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Patients can only view their own dashboard data"
        )
        
    db = get_database()
    
    # 2. Gather patient identity
    patient_user = await db["users"].find_one({"_id": patient_id})
    if not patient_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
        
    # 3. Gather patient medical profile
    patient_profile = await db["patients"].find_one({"patient_id": patient_id})
    profile_data = {
        "preferred_name": patient_profile.get("preferred_name") if patient_profile else None,
        "phone": patient_profile.get("phone") if patient_profile else None,
        "date_of_birth": patient_profile.get("date_of_birth") if patient_profile else None,
        "gender": patient_profile.get("gender") if patient_profile else None,
        "blood_group": patient_profile.get("blood_group") if patient_profile else None,
        "primary_conditions": patient_profile.get("primary_conditions", []) if patient_profile else [],
        "mental_disabilities": patient_profile.get("mental_disabilities", []) if patient_profile else [],
        "physical_disabilities": patient_profile.get("physical_disabilities", []) if patient_profile else [],
        "lifetime_medications": patient_profile.get("lifetime_medications") if patient_profile else None,
        "physician_name": patient_profile.get("physician_name") if patient_profile else None,
        "clinic_phone": patient_profile.get("clinic_phone") if patient_profile else None,
        "emergency_contacts": patient_profile.get("emergency_contacts", []) if patient_profile else [],
        "medical_history": patient_profile.get("medical_history", []) if patient_profile else [],
        "allergies": patient_profile.get("allergies", []) if patient_profile else [],
        "home_address": patient_profile.get("home_address") if patient_profile else None
    }
    
    # 4. Gather active medications list
    medications = await db["medicines"].find({"patient_id": patient_id}).to_list(length=100)
    
    # 5. Gather daily compliance logs and calculate metrics
    compliance_logs = await db["compliance_logs"].find({"patient_id": patient_id}).to_list(length=100)
    
    completed_count = sum(1 for log in compliance_logs if log.get("status") == "completed")
    missed_count = sum(1 for log in compliance_logs if log.get("status") == "missed")
    total_logged = completed_count + missed_count
    
    compliance_rate = 100.0
    if total_logged > 0:
        compliance_rate = round((completed_count / total_logged) * 100, 2)
        
    # 6. Gather recent symptom journals (past voice logs & doctor briefs)
    journals = await db["journals"].find({"patient_id": patient_id}).to_list(length=10)
    # Sort in memory since mock db find() doesn't sort
    journals.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    
    # 7. Gather clinic queue wait status (if any)
    queue_status = None
    try:
        # Call the helper queue status logic
        queue_status = await get_queue_status(patient_id=patient_id)
    except HTTPException:
        # Patient is not currently in the queue, return None or helper indication
        queue_status = {
            "in_queue": False,
            "message": "Patient is not currently in the clinic visit queue."
        }
        
    # 8. Gather historical caregiver alert notifications (simulating SOS and missed dose alerts)
    alerts = await db["notifications"].find({"patient_id": patient_id}).to_list(length=20)
    alerts.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    
    return {
        "patient_id": patient_id,
        "patient_name": patient_user.get("name"),
        "patient_email": patient_user.get("email"),
        "compliance_stats": {
            "compliance_rate": compliance_rate,
            "total_logged_doses": total_logged,
            "completed_count": completed_count,
            "missed_count": missed_count
        },
        "profile": profile_data,
        "medications": medications,
        "compliance_history": compliance_logs,
        "recent_journals": journals,
        "queue_status": queue_status,
        "caregiver_alerts": alerts
    }
