import logging
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.database import get_database
from app.services.llm import check_food_interaction

router = APIRouter(prefix="/ai", tags=["Assistive AI Interactions"])
logger = logging.getLogger("silvercare.routes.ai")

class FoodInteractionRequest(BaseModel):
    query: str
    patient_id: str

@router.post("/food-interaction")
async def food_interaction(payload: FoodInteractionRequest):
    """
    Receives a food/drink interaction query, references it against the patient's
    current active medication array, and returns an LLM-generated safety warning.
    """
    db = get_database()
    
    # 1. Fetch patient details
    patient = await db["users"].find_one({"_id": payload.patient_id})
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
        
    # 2. Fetch active medications
    active_meds = await db["medicines"].find({"patient_id": payload.patient_id}).to_list(length=100)
    
    try:
        # 3. Query LLM
        safety_analysis = await check_food_interaction(payload.query, active_meds)
        
        return {
            "patient_id": payload.patient_id,
            "query": payload.query,
            "active_medications": [med.get("name") for med in active_meds],
            "safety_warning": safety_analysis
        }
    except Exception as e:
        logger.error(f"AI food-interaction analysis failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compile AI safety warning: {str(e)}"
        )

from typing import Optional
from app.services.llm import ask_general_question

class ChatRequest(BaseModel):
    query: str
    patient_id: Optional[str] = None

@router.post("/chat")
async def general_chat(payload: ChatRequest):
    """
    Answers a general health/safety question using the generative AI bot.
    """
    db = get_database()
    active_meds = []
    if payload.patient_id:
        active_meds = await db["medicines"].find({"patient_id": payload.patient_id}).to_list(length=100)
        
    try:
        response = await ask_general_question(payload.query, active_meds)
        return {
            "query": payload.query,
            "response": response
        }
    except Exception as e:
        logger.error(f"AI general chat failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate AI response: {str(e)}"
        )
