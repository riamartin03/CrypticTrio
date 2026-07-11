import asyncio
import logging
from datetime import datetime
from app.database import get_database

logger = logging.getLogger("silvercare.services.notification")

async def send_mock_sms(phone: str, message: str):
    """Simulates sending an SMS."""
    logger.info(f"[SMS ALERT] Sending to {phone}: '{message}'")
    # Simulate network latency
    await asyncio.sleep(0.5)

async def send_mock_email(email: str, subject: str, body: str):
    """Simulates sending an email."""
    logger.info(f"[EMAIL ALERT] Sending to {email} - Subject: {subject}")
    # Simulate network latency
    await asyncio.sleep(0.5)

async def trigger_caregiver_alert(patient_id: str, medicine_id: str, time_slot: str):
    """
    Simulates checking verification and firing a caregiver alert.
    Can be run as a FastAPI BackgroundTask.
    """
    db = get_database()
    
    # 1. Fetch patient profile & info
    patient_user = await db["users"].find_one({"_id": patient_id})
    patient_name = patient_user.get("name", "Patient") if patient_user else "Patient"
    
    # 2. Fetch medication details
    med = await db["medicines"].find_one({"_id": medicine_id})
    med_name = med.get("name", "Medication") if med else "Medication"
    is_critical = med.get("is_critical", False) if med else False
    
    # 3. Find caregiver(s) linked to this patient
    caregivers = await db["users"].find({"role": "caregiver", "associated_user_ids": patient_id}).to_list(length=10)
    
    # Create the alert message
    alert_subject = f"⚠️ SilverCare Alert: Missed Critical Medication - {patient_name}"
    alert_body = (
        f"Alert! Patient {patient_name} has missed their critical medication: '{med_name}' "
        f"scheduled for the {time_slot} slot.\n"
        f"This medication was marked critical, and no verification was logged within the 30-minute window."
    )
    
    # Save the alert to the db 'notifications' collection so it can be queried in dashboards
    alert_doc = {
        "patient_id": patient_id,
        "patient_name": patient_name,
        "medicine_id": medicine_id,
        "medicine_name": med_name,
        "time_slot": time_slot,
        "is_critical": is_critical,
        "message": alert_body,
        "timestamp": datetime.utcnow().isoformat(),
        "read": False
    }
    await db["notifications"].insert_one(alert_doc)
    
    if not caregivers:
        logger.warning(f"No caregivers found linked to patient ID {patient_id}. Simulating alert locally only.")
        return
        
    for caregiver in caregivers:
        caregiver_email = caregiver.get("email")
        caregiver_name = caregiver.get("name", "Caregiver")
        
        # Simulating dispatch
        logger.info(f"Dispatching emergency compliance warning to Caregiver: {caregiver_name} ({caregiver_email})")
        
        # Run async mock notifications
        await send_mock_email(
            email=caregiver_email,
            subject=alert_subject,
            body=f"Hi {caregiver_name},\n\n{alert_body}\n\nBest,\nSilverCare Alert System"
        )
        
        # If caregiver has a phone number registered
        phone = caregiver.get("phone", "+15550199")
        await send_mock_sms(
            phone=phone,
            message=f"SilverCare Alert: {patient_name} missed critical med '{med_name}' for {time_slot}."
        )
        
    logger.info("Caregiver alerts successfully simulated.")

async def trigger_sos_alert(patient_id: str):
    """
    Simulates sending an immediate emergency SOS alert (SMS/Email) to Caregiver.
    Saves the alert to the db 'notifications' collection.
    """
    db = get_database()
    patient_user = await db["users"].find_one({"_id": patient_id})
    patient_name = patient_user.get("name", "Patient") if patient_user else "Patient"
    caregivers = await db["users"].find({"role": "caregiver", "associated_user_ids": patient_id}).to_list(length=10)
    
    alert_subject = f"🚨 EMERGENCY SOS ALERT: Patient {patient_name} needs help!"
    alert_body = (
        f"CRITICAL WARNING! Patient {patient_name} has triggered their emergency SOS Panic Button!\n"
        f"Please check on them immediately or call emergency services if they are unresponsive."
    )
    
    alert_doc = {
        "patient_id": patient_id,
        "patient_name": patient_name,
        "medicine_id": None,
        "medicine_name": "Emergency SOS Trigger",
        "time_slot": "Emergency",
        "is_critical": True,
        "message": alert_body,
        "timestamp": datetime.utcnow().isoformat(),
        "read": False
    }
    await db["notifications"].insert_one(alert_doc)
    
    for caregiver in caregivers:
        caregiver_email = caregiver.get("email")
        caregiver_name = caregiver.get("name", "Caregiver")
        
        await send_mock_email(
            email=caregiver_email,
            subject=alert_subject,
            body=f"Hi {caregiver_name},\n\n{alert_body}\n\nBest,\nSilverCare Alert System"
        )
        
        phone = caregiver.get("phone", "+15550199")
        await send_mock_sms(
            phone=phone,
            message=f"🚨 SilverCare EMERGENCY SOS: {patient_name} pressed the panic button!"
        )
    logger.info("Emergency SOS alert successfully dispatched.")

