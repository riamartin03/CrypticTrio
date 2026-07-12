import json
import logging
from typing import Optional, Dict, Any, List
import google.generativeai as genai
from app.config import settings

logger = logging.getLogger("silvercare.services.llm")

# Initialize Gemini if API key is present
gemini_available = False
if settings.GEMINI_API_KEY:
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        gemini_available = True
        logger.info("Gemini API initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize Gemini API: {e}")

async def generate_doctor_brief(transcript: str, patient_name: str) -> str:
    """
    Compiles messy text journal logs into a structured doctor brief in markdown format.
    """
    prompt = f"""
    You are an expert assistive clinical AI. Review the following patient voice journal transcript and compile a structured "Doctor Brief" in Markdown.
    
    Patient Name: {patient_name}
    Transcript: "{transcript}"
    
    The brief should contain:
    1. Symptoms: List any reported physical/mental symptoms, their severity, and descriptors.
    2. Timeline: When did these symptoms occur (e.g. morning, afternoon, specific times)?
    3. Key Points / Recommendations: Core observations or actions (e.g., drink more water, rest).
    
    Keep the output professional, direct, and structured with headings.
    """
    
    if gemini_available:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini generate_doctor_brief failed: {e}. Falling back to mock.")
            
    # Mock fallback
    symptoms = []
    if "dizzy" in transcript.lower():
        symptoms.append("Dizziness / Vertigo")
    if "head" in transcript.lower() or "pain" in transcript.lower():
        symptoms.append("Headache / Head pressure")
    if "tired" in transcript.lower() or "fatigue" in transcript.lower() or "weak" in transcript.lower():
        symptoms.append("Fatigue / Weakness")
    if "cough" in transcript.lower() or "cold" in transcript.lower():
        symptoms.append("Respiratory congestion / Cough")
    if not symptoms:
        symptoms.append("General discomfort (unspecified)")
        
    timeline = "Not specified"
    for word in ["morning", "afternoon", "evening", "night", "9 am", "noon", "8 pm"]:
        if word in transcript.lower():
            timeline = f"Reported around {word}"
            break
            
    brief = f"""### Doctor Brief for {patient_name}
*Generated via Clinical Summary Assistant (Mock Fallback)*

#### 1. Symptoms
"""
    for s in symptoms:
        brief += f"- {s}\n"
    brief += f"""
#### 2. Timeline
- {timeline}

#### 3. Key Points & Recommendations
- **Transcript Summary**: Patient states: "{transcript}"
- **Observation**: Symptoms appear mild but should be monitored. Check if patient took scheduled medication.
- **Action**: Encourage hydration, rest, and alert caregiver if symptoms persist.
"""
    return brief

async def parse_prescription(ocr_text: str) -> Dict[str, Any]:
    """
    Uses LLM to parse prescription OCR text or instructions into structured dosage parameters.
    """
    prompt = f"""
    You are a pharmacy AI. Extract the medicine details from this prescription text and format as a JSON object matching this schema:
    {{
        "name": "Medication Name",
        "visual_identifiers": {{
            "shape": "Oval or Round or Capsule",
            "color": "White or Pink or Blue, etc."
        }},
        "scheduled_times": ["Morning", "Afternoon", "Evening", "Night"],
        "custom_instructions": "Any specific instructions, like 'Take with food'",
        "is_critical": true or false
    }}
    
    Prescription OCR: "{ocr_text}"
    Return ONLY raw JSON. No markdown code blocks.
    """
    
    if gemini_available:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            # Clean possible markdown wrap
            text = response.text.strip()
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            return json.loads(text.strip())
        except Exception as e:
            logger.error(f"Gemini parse_prescription failed: {e}. Falling back to mock parser.")
            
    # Mock parser fallback
    ocr_lower = ocr_text.lower()
    name = "Unknown Medication"
    for common_med in ["metformin", "lisinopril", "atorvastatin", "aspirin", "amlodipine", "levothyroxine"]:
        if common_med in ocr_lower:
            name = common_med.capitalize()
            break
            
    shape = "Round"
    color = "White"
    if "oval" in ocr_lower:
        shape = "Oval"
    elif "capsule" in ocr_lower:
        shape = "Capsule"
    if "yellow" in ocr_lower:
        color = "Yellow"
    elif "pink" in ocr_lower:
        color = "Pink"
    elif "blue" in ocr_lower:
        color = "Blue"

    scheduled_times = []
    if "morning" in ocr_lower or "daily" in ocr_lower or "qd" in ocr_lower:
        scheduled_times.append("Morning")
    if "afternoon" in ocr_lower or "bid" in ocr_lower:
        scheduled_times.append("Afternoon")
    if "evening" in ocr_lower or "bid" in ocr_lower or "tid" in ocr_lower:
        scheduled_times.append("Evening")
    if "night" in ocr_lower or "hs" in ocr_lower:
        scheduled_times.append("Night")
        
    if not scheduled_times:
        scheduled_times = ["Morning"]
        
    instructions = "Take as directed by doctor"
    if "food" in ocr_lower:
        instructions = "Take with food"
    elif "empty stomach" in ocr_lower:
        instructions = "Take on an empty stomach"
        
    is_critical = False
    if "critical" in ocr_lower or "heart" in ocr_lower or "blood pressure" in ocr_lower:
        is_critical = True
        
    return {
        "name": name,
        "visual_identifiers": {
            "shape": shape,
            "color": color
        },
        "scheduled_times": scheduled_times,
        "custom_instructions": instructions,
        "is_critical": is_critical
    }

async def parse_prescription_image(image_bytes: bytes, mime_type: str) -> Dict[str, Any]:
    """
    Uses LLM to extract medicine details from a raw prescription image.
    """
    prompt = """
    You are a pharmacy AI. Extract the medicine details from this prescription image and format as a JSON object matching this schema:
    {
        "name": "Medication Name",
        "visual_identifiers": {
            "shape": "Oval or Round or Capsule",
            "color": "White or Pink or Blue, etc."
        },
        "scheduled_times": ["Morning", "Afternoon", "Evening", "Night"],
        "custom_instructions": "Any specific instructions, like 'Take with food'",
        "is_critical": true or false
    }
    
    Return ONLY raw JSON. No markdown code blocks.
    """
    
    if gemini_available:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content([
                {"mime_type": mime_type, "data": image_bytes},
                prompt
            ])
            text = response.text.strip()
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            return json.loads(text.strip())
        except Exception as e:
            logger.error(f"Gemini parse_prescription_image failed: {e}. Falling back to text parser.")
            
    # Mock text parsed fallback
    return await parse_prescription("Mock prescription image containing Metformin. Take one oval white pill morning and night with food. Heart/diabetes critical.")

async def check_food_interaction(query: str, active_meds: List[Dict[str, Any]]) -> str:
    """
    Checks food-drug interactions between a patient's active medications and a text query.
    """
    med_names = [med.get("name") for med in active_meds]
    meds_str = ", ".join(med_names) if med_names else "No active medications"
    
    prompt = f"""
    You are a clinical pharmacist AI. A patient is asking: "{query}".
    Their active medication list is: {meds_str}.
    
    Analyze if there are any clinically significant interactions between their query (food, drink, or supplements) and their medications.
    
    Provide a response in plain, clear, easy-to-understand language for an elderly patient.
    Include:
    - Safety Status: (SAFE, CAUTION, or DANGEROUS)
    - Explanation: Why is it safe/unsafe?
    - Simple advice: What should they do?
    """
    
    if gemini_available:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini check_food_interaction failed: {e}. Falling back to mock.")
            
    # Mock fallback
    query_lower = query.lower()
    caution_meds = []
    
    # Simple heuristic checks
    if "grapefruit" in query_lower:
        for med in med_names:
            if med.lower() in ["atorvastatin", "simvastatin", "amlodipine"]:
                caution_meds.append((med, "grapefruit can increase blood levels of this medication, increasing side effects."))
    if "milk" in query_lower or "calcium" in query_lower:
        for med in med_names:
            if med.lower() in ["ciprofloxacin", "doxycycline", "synthroid", "levothyroxine"]:
                caution_meds.append((med, "calcium binds to this medication, reducing absorption. Take at least 2 hours apart."))
    if "alcohol" in query_lower:
        for med in med_names:
            if med.lower() in ["metformin", "aspirin", "warfarin", "xanax", "ibuprofen"]:
                caution_meds.append((med, "alcohol can increase risk of liver stress, stomach bleeding, or excessive drowsiness."))

    if caution_meds:
        warning_msg = "### ⚠️ Safety Warning: CAUTION / DANGEROUS\n\n"
        warning_msg += "There is a potential interaction with your current medications:\n"
        for med, reason in caution_meds:
            warning_msg += f"- **{med}**: {reason}\n"
        warning_msg += "\n**Advice**: Please avoid combining these or consult your pharmacist/doctor to adjust your timing."
        return warning_msg
    else:
        return f"### ✅ Safety Status: SAFE\n\nBased on your active medications ({meds_str}), there are no major known interactions with your query: '{query}'.\n\n**Advice**: You may proceed, but as always, consume in moderation and report any unusual symptoms to your caregiver or physician."

async def ask_general_question(query: str, active_meds: List[Dict[str, Any]] = None) -> str:
    """
    Answers a general health/safety question using Gemini, taking active meds into account.
    """
    med_names = [med.get("name") for med in active_meds] if active_meds else []
    meds_str = ", ".join(med_names) if med_names else "No active medications"
    
    prompt = f"""
    You are a warm, caring, and empathetic AI health companion. A user is asking the following question:
    "{query}"
    
    Their current active medication list is: {meds_str}.
    
    Provide an accurate, easy-to-understand, and comforting response. If their query has any potential interactions with their active medications, warn them clearly.
    Speak naturally and conversationally, as a caring family member or companion would.
    
    CRITICAL: Do NOT use raw markdown formatting, hashtags, asterisks, or robotic bullet points. Keep it as clean, readable paragraphs of natural text.
    Keep the answer concise and friendly, and include a natural, gentle reminder to check in with their doctor or pharmacist.
    """
    
    if gemini_available:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            # Remove any residual markdown characters just in case
            clean_res = response.text.replace("**", "").replace("###", "").replace("*", "").strip()
            return clean_res
        except Exception as e:
            logger.error(f"Gemini ask_general_question failed: {e}. Falling back to mock.")
            
    # Mock fallback answers (warm and conversational)
    q_lower = query.lower()
    if "fever" in q_lower:
        return "I'm sorry to hear you're dealing with a fever. For a mild fever, the best things you can do are to get plenty of cozy rest and sip warm fluids like water or herbal tea. Over-the-counter remedies can help bring it down, but please promise me you'll call your doctor if the fever gets high (above 103°F) or lasts for more than a couple of days. Rest up!"
    elif "blood pressure" in q_lower:
        return "Keeping an eye on your blood pressure is so important! Generally, doctors like to see it stay around 120/80. To help keep it in a healthy range, try to enjoy meals with less salt, take gentle daily walks, and remember to take your medications on time. It's always a good idea to check with your doctor to find out what specific target is best for you."
    elif "dementia" in q_lower:
        return "Dealing with memory changes can be a journey, but please know you're not alone. Creating a calm, predictable daily routine and keeping things organized with clear labels around the house can make a world of difference. Remember to take it one gentle step at a time, and never hesitate to lean on family or a caregiver for support."
    
    return f"Thanks for asking! Regarding '{query}', I'd suggest starting with simple comforts: make sure you're drinking enough water, getting a good night's sleep, and checking off your daily tasks. Since I'm an AI companion, please remember to verify with your doctor or pharmacist to get advice tailored just for you."
