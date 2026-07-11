import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from app.database import get_database
from app.models.user import UserResponse
from app.models.patient import PatientProfileBase, PatientProfileResponse, PatientProfileCreate
from app.routes.auth import get_current_user
from app.services.notification import trigger_sos_alert

router = APIRouter(prefix="/user", tags=["User Profiles"])
logger = logging.getLogger("silvercare.routes.user")

@router.get("/profile", response_model=Dict[str, Any])
async def get_profile(current_user: dict = Depends(get_current_user)):
    """
    Fetches the profile for the current authenticated user.
    If the user is a patient, returns user info + patient details.
    If the user is a caregiver, returns user info + associated patient profiles.
    """
    db = get_database()
    response_data = {
        "id": current_user["_id"],
        "email": current_user["email"],
        "name": current_user["name"],
        "role": current_user["role"],
        "associated_user_ids": current_user.get("associated_user_ids", [])
    }
    
    if current_user["role"] == "patient":
        # Fetch Patient Profile Details (emergency contacts, allergies, home_address, medical history)
        patient_profile = await db["patients"].find_one({"patient_id": current_user["_id"]})
        if patient_profile:
            response_data["profile"] = {
                "preferred_name": patient_profile.get("preferred_name"),
                "phone": patient_profile.get("phone"),
                "date_of_birth": patient_profile.get("date_of_birth"),
                "gender": patient_profile.get("gender"),
                "blood_group": patient_profile.get("blood_group"),
                "primary_conditions": patient_profile.get("primary_conditions", []),
                "mental_disabilities": patient_profile.get("mental_disabilities", []),
                "physical_disabilities": patient_profile.get("physical_disabilities", []),
                "lifetime_medications": patient_profile.get("lifetime_medications"),
                "physician_name": patient_profile.get("physician_name"),
                "clinic_phone": patient_profile.get("clinic_phone"),
                "emergency_contacts": patient_profile.get("emergency_contacts", []),
                "medical_history": patient_profile.get("medical_history", []),
                "allergies": patient_profile.get("allergies", []),
                "home_address": patient_profile.get("home_address")
            }
        else:
            # Fallback empty profile
            response_data["profile"] = {
                "preferred_name": None,
                "phone": None,
                "date_of_birth": None,
                "gender": None,
                "blood_group": None,
                "primary_conditions": [],
                "mental_disabilities": [],
                "physical_disabilities": [],
                "lifetime_medications": None,
                "physician_name": None,
                "clinic_phone": None,
                "emergency_contacts": [],
                "medical_history": [],
                "allergies": [],
                "home_address": None
            }
            
    elif current_user["role"] == "caregiver":
        # Aggregate info for linked patients
        linked_patients = []
        for pat_id in current_user.get("associated_user_ids", []):
            pat_user = await db["users"].find_one({"_id": pat_id})
            if pat_user:
                pat_profile = await db["patients"].find_one({"patient_id": pat_id})
                if pat_profile and "_id" in pat_profile:
                    pat_profile["id"] = str(pat_profile.pop("_id"))
                linked_patients.append({
                    "patient_id": pat_id,
                    "name": pat_user.get("name"),
                    "email": pat_user.get("email"),
                    "profile": pat_profile if pat_profile else {}
                })
        response_data["linked_patients"] = linked_patients
        
    return response_data

@router.put("/profile", response_model=Dict[str, Any])
async def update_profile(profile_data: PatientProfileCreate, current_user: dict = Depends(get_current_user)):
    """
    Allows a patient (or caregiver linked to the patient) to update their patient profile.
    """
    db = get_database()
    
    # Check authorization: can only update own profile or associated patient's profile
    target_patient_id = profile_data.patient_id
    if current_user["role"] == "patient" and current_user["_id"] != target_patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Patients can only update their own profile data"
        )
    elif current_user["role"] == "caregiver" and target_patient_id not in current_user.get("associated_user_ids", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Caregivers can only update profile data of associated patients"
        )
        
    # Perform upsert
    update_result = await db["patients"].update_one(
        {"patient_id": target_patient_id},
        {"$set": {
            "preferred_name": profile_data.preferred_name,
            "phone": profile_data.phone,
            "date_of_birth": profile_data.date_of_birth,
            "gender": profile_data.gender,
            "blood_group": profile_data.blood_group,
            "primary_conditions": profile_data.primary_conditions,
            "mental_disabilities": profile_data.mental_disabilities,
            "physical_disabilities": profile_data.physical_disabilities,
            "lifetime_medications": profile_data.lifetime_medications,
            "physician_name": profile_data.physician_name,
            "clinic_phone": profile_data.clinic_phone,
            "emergency_contacts": [c.model_dump() for c in profile_data.emergency_contacts],
            "medical_history": profile_data.medical_history,
            "allergies": profile_data.allergies,
            "home_address": profile_data.home_address.model_dump() if profile_data.home_address else None
        }},
        upsert=True
    )
    
    # Fetch updated profile
    updated_profile = await db["patients"].find_one({"patient_id": target_patient_id})
    if updated_profile and "_id" in updated_profile:
        updated_profile["id"] = str(updated_profile.pop("_id"))
        
    return {
        "message": "Patient profile updated successfully",
        "profile": updated_profile
    }

@router.post("/sos", status_code=status.HTTP_200_OK)
async def trigger_patient_sos(patient_id: str, background_tasks: BackgroundTasks):
    """
    Triggers an immediate caregiver alert for an emergency SOS event.
    """
    db = get_database()
    patient = await db["users"].find_one({"_id": patient_id})
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    background_tasks.add_task(trigger_sos_alert, patient_id)
    return {"message": "SOS emergency warning successfully queued for caregiver dispatch."}

