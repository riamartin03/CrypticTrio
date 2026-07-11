import logging
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status
from app.database import get_database

router = APIRouter(prefix="/navigation", tags=["Assistive Navigation"])
logger = logging.getLogger("silvercare.routes.navigation")

@router.get("/home-route", response_model=Dict[str, Any])
async def get_home_route(patient_id: str):
    """
    Processes patient coordinates and returns their home address and a Google/Apple Maps
    direction link to facilitate direct assistive navigation back home.
    """
    db = get_database()
    
    # 1. Fetch patient profile details
    profile = await db["patients"].find_one({"patient_id": patient_id})
    if not profile or not profile.get("home_address"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient home address coordinates not configured in profile"
        )
        
    home_address = profile.get("home_address")
    address_text = home_address.get("address_text", "")
    lat = home_address.get("latitude")
    lon = home_address.get("longitude")
    
    # 2. Build maps URL (Google Maps directions link)
    # We use a universal URL format that triggers maps apps on iOS/Android or browsers
    maps_url = f"https://www.google.com/maps/dir/?api=1&destination={lat},{lon}"
    
    return {
        "patient_id": patient_id,
        "home_address": address_text,
        "latitude": lat,
        "longitude": lon,
        "navigation_url": maps_url,
        "embed_map_link": f"https://maps.google.com/maps?q={lat},{lon}&hl=en&z=14&output=embed"
    }
