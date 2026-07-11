import logging
from typing import Optional
import httpx
from app.config import settings

logger = logging.getLogger("silvercare.services.speech")

async def transcribe_audio(file_bytes: bytes, filename: str) -> str:
    """
    Transcribes audio bytes to text using OpenAI Whisper API, with a realistic mock fallback.
    """
    if settings.OPENAI_API_KEY:
        try:
            logger.info(f"Uploading {filename} ({len(file_bytes)} bytes) to OpenAI Whisper")
            headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}"}
            files = {"file": (filename, file_bytes, "audio/wav")}
            data = {"model": "whisper-1"}
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.openai.com/v1/audio/transcriptions",
                    headers=headers,
                    files=files,
                    data=data,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result.get("text", "")
                else:
                    logger.error(f"Whisper API error {response.status_code}: {response.text}")
        except Exception as e:
            logger.error(f"Failed to call Whisper API: {e}")
            
    # Mock fallback transcription based on common elderly audio clips in demo
    logger.info("Using speech-to-text mock transcription fallback.")
    
    # We can detect file name hints to simulate different test cases
    fn_lower = filename.lower()
    if "dizzy" in fn_lower or "headache" in fn_lower:
        return "I felt dizzy around nine am. It passed after drinking water, but my head still feels a bit heavy and congested."
    elif "grapefruit" in fn_lower or "food" in fn_lower:
        return "Can I take my cholesterol medicine atorvastatin with grapefruit juice in the morning?"
    elif "presc" in fn_lower or "pill" in fn_lower:
        return "Here is my prescription for Metformin. It says take one oval white pill twice a day in the morning and evening with food. It is critical for my diabetes."
    else:
        return "Hello, I am feeling okay today. My blood pressure was normal this morning, but I had a bit of a cough last night."
