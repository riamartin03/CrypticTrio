import logging
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.database import get_database
from app.models.schemas import PatientProfileResponse

router = APIRouter(prefix="/patient", tags=["Patients"])
logger = logging.getLogger("silvercare.routes.patients")

@router.get("/profile/{user_id}", response_model=PatientProfileResponse)
async def get_patient_profile(user_id: str):
    db = get_database()
    doc = await db["patients"].find_one({"_id": user_id})
    if not doc:
        doc = await db["patients"].find_one({"patient_id": user_id})
        
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found in database."
        )
        
    # Map raw MongoDB document formats to schemas
    return PatientProfileResponse(
        user_id=doc.get("patient_id") or doc.get("user_id") or user_id,
        personal_info={
            "nickname": doc.get("personal_info", {}).get("nickname") or doc.get("preferred_name") or doc.get("nickname") or "",
            "phone_no": doc.get("personal_info", {}).get("phone_no") or doc.get("phone") or doc.get("phone_no") or "",
            "dob": doc.get("personal_info", {}).get("dob") or doc.get("date_of_birth") or doc.get("dob") or "",
            "gender": doc.get("personal_info", {}).get("gender") or doc.get("gender") or "",
            "full_street_address": doc.get("personal_info", {}).get("full_street_address") or (doc.get("home_address", {}).get("address_text") if isinstance(doc.get("home_address"), dict) else doc.get("full_street_address")) or "",
            "city": doc.get("personal_info", {}).get("city") or (doc.get("home_address", {}).get("city") if isinstance(doc.get("home_address"), dict) else doc.get("city")) or "",
            "gps_coordinates": doc.get("personal_info", {}).get("gps_coordinates") or doc.get("gps_coordinates") or (f"{doc.get('home_address', {}).get('latitude')},{doc.get('home_address', {}).get('longitude')}" if isinstance(doc.get("home_address"), dict) and doc.get("home_address", {}).get("latitude") else "")
        },
        medical_records={
            "blood_group": doc.get("medical_records", {}).get("blood_group") or doc.get("blood_group") or "",
            "primary_medical_conditions": doc.get("medical_records", {}).get("primary_medical_conditions") or doc.get("primary_conditions") or [],
            "mental_and_cognitive_disabilities": doc.get("medical_records", {}).get("mental_and_cognitive_disabilities") or doc.get("mental_disabilities") or [],
            "known_allergies_and_drug_reactions": doc.get("medical_records", {}).get("known_allergies_and_drug_reactions") or doc.get("allergies") or []
        },
        care_network={
            "primary_care_physician_name": doc.get("care_network", {}).get("primary_care_physician_name") or doc.get("physician_name") or "",
            "clinic_phone_no": doc.get("care_network", {}).get("clinic_phone_no") or doc.get("clinic_phone") or "",
            "primary_caretaker_name": doc.get("care_network", {}).get("primary_caretaker_name") or (doc.get("emergency_contacts", [{}])[0].get("name") if doc.get("emergency_contacts") else "") or "",
            "caretaker_phone_no": doc.get("care_network", {}).get("caretaker_phone_no") or (doc.get("emergency_contacts", [{}])[0].get("phone") if doc.get("emergency_contacts") else "") or "",
            "caretaker_email": doc.get("care_network", {}).get("caretaker_email") or (doc.get("emergency_contacts", [{}])[0].get("email") if doc.get("emergency_contacts") else "") or "",
        },
        master_medications=doc.get("master_medications") or doc.get("medications") or []
    )

@router.post("/profile", response_model=Dict[str, Any])
async def save_patient_profile(profile: PatientProfileResponse):
    db = get_database()
    profile_data = profile.model_dump()
    profile_data["_id"] = profile.user_id
    profile_data["patient_id"] = profile.user_id
    
    # Save flat compatibility keys
    profile_data["preferred_name"] = profile.personal_info.nickname
    profile_data["phone"] = profile.personal_info.phone_no
    profile_data["date_of_birth"] = profile.personal_info.dob
    profile_data["gender"] = profile.personal_info.gender
    profile_data["blood_group"] = profile.medical_records.blood_group
    profile_data["primary_conditions"] = profile.medical_records.primary_medical_conditions
    profile_data["mental_disabilities"] = profile.medical_records.mental_and_cognitive_disabilities
    profile_data["allergies"] = profile.medical_records.known_allergies_and_drug_reactions
    profile_data["physician_name"] = profile.care_network.primary_care_physician_name
    profile_data["clinic_phone"] = profile.care_network.clinic_phone_no
    profile_data["emergency_contacts"] = [
        {
            "name": profile.care_network.primary_caretaker_name,
            "phone": profile.care_network.caretaker_phone_no,
            "email": profile.care_network.caretaker_email,
            "relationship": "Primary Caregiver"
        }
    ]
    
    gps = profile.personal_info.gps_coordinates
    profile_data["home_address"] = {
        "address_text": profile.personal_info.full_street_address or "",
        "city": profile.personal_info.city or "",
        "latitude": float(gps.split(",")[0]) if gps and "," in gps else 37.3382,
        "longitude": float(gps.split(",")[1]) if gps and "," in gps else -121.8863
    }
    
    await db["patients"].replace_one({"_id": profile.user_id}, profile_data, upsert=True)
    return {"status": "success", "message": "Patient profile successfully upserted in Hybrid format."}
