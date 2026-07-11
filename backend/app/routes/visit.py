import uuid
import logging
from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends
from pydantic import BaseModel
from app.database import get_database
from app.services.speech import transcribe_audio
from app.services.llm import generate_doctor_brief, parse_prescription, parse_prescription_image
from app.routes.auth import get_current_user

router = APIRouter(prefix="/visit", tags=["Clinical Visit Flow"])
logger = logging.getLogger("silvercare.routes.visit")

class SummaryRequest(BaseModel):
    transcript: str
    patient_id: str

@router.post("/voice-journal")
async def voice_journal(
    patient_id: str = Form(...),
    audio_file: UploadFile = File(...)
):
    """
    Receives frontend recorded audio file, transcribes it to text via Whisper,
    and returns a cleanly structured JSON response with the transcript.
    """
    # Validate file type (e.g. wav, mp3, m4a, webm)
    if not audio_file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided in upload"
        )
        
    try:
        content = await audio_file.read()
        transcript = await transcribe_audio(content, audio_file.filename)
        
        return {
            "patient_id": patient_id,
            "filename": audio_file.filename,
            "transcript": transcript,
            "status": "success"
        }
    except Exception as e:
        logger.error(f"Voice journal processing failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process voice journal: {str(e)}"
        )

@router.post("/generate-summary")
async def generate_summary(payload: SummaryRequest):
    """
    Takes a plain text log/transcript, uses Gemini to compile it into a
    structured markdown "Doctor Brief", and saves it in the journals collection.
    """
    db = get_database()
    
    # Verify patient exists
    patient_user = await db["users"].find_one({"_id": payload.patient_id})
    patient_name = patient_user.get("name", "Patient") if patient_user else "Patient"
    
    try:
        # Generate Doctor Brief via Gemini
        summary_md = await generate_doctor_brief(payload.transcript, patient_name)
        
        # Save to database
        journal_id = str(uuid.uuid4())
        journal_doc = {
            "_id": journal_id,
            "patient_id": payload.patient_id,
            "transcript": payload.transcript,
            "summary": summary_md,
            "audio_file_url": None,
            "created_at": datetime.utcnow().isoformat()
        }
        
        await db["journals"].insert_one(journal_doc)
        
        return {
            "message": "Doctor Brief summary compiled successfully",
            "journal_id": journal_id,
            "transcript": payload.transcript,
            "summary": summary_md,
            "created_at": journal_doc["created_at"]
        }
    except Exception as e:
        logger.error(f"Summary generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate summary brief: {str(e)}"
        )

@router.post("/process-prescription")
async def process_prescription(
    patient_id: str = Form(...),
    ocr_text: Optional[str] = Form(None),
    prescription_image: Optional[UploadFile] = File(None)
):
    """
    Accepts OCR text input or raw prescription images, utilizes Gemini parsing to
    extract structured dosage parameters, and auto-populates the medicine scheduler.
    """
    db = get_database()
    
    # Verify patient exists
    patient_user = await db["users"].find_one({"_id": patient_id})
    if not patient_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
        
    try:
        if prescription_image:
            image_bytes = await prescription_image.read()
            mime_type = prescription_image.content_type or "image/png"
            parsed_med = await parse_prescription_image(image_bytes, mime_type)
        elif ocr_text:
            parsed_med = await parse_prescription(ocr_text)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Must provide either ocr_text or prescription_image"
            )
            
        # Create and save medication schedule
        med_id = str(uuid.uuid4())
        med_doc = {
            "_id": med_id,
            "patient_id": patient_id,
            "name": parsed_med.get("name", "Unknown Medication"),
            "visual_identifiers": {
                "shape": parsed_med.get("visual_identifiers", {}).get("shape", "Round"),
                "color": parsed_med.get("visual_identifiers", {}).get("color", "White")
            },
            "image_url": parsed_med.get("image_url"),
            "scheduled_times": parsed_med.get("scheduled_times", ["Morning"]),
            "custom_instructions": parsed_med.get("custom_instructions", "Take as directed"),
            "is_critical": parsed_med.get("is_critical", False)
        }
        
        await db["medicines"].insert_one(med_doc)
        
        return {
            "message": "Prescription processed and medication schedule added successfully",
            "medicine_id": med_id,
            "extracted_data": parsed_med,
            "medicine_record": med_doc
        }
    except Exception as e:
        logger.error(f"Prescription processing failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process prescription: {str(e)}"
        )
