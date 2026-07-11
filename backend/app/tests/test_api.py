import pytest
from httpx import AsyncClient
import sys
import os

# Adjust path to import app correctly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app
from app.config import settings

# Force MOCK_MODE for test runs
settings.MOCK_MODE = True

@pytest.mark.asyncio
async def test_root_endpoint():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_full_application_workflow():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        
        # 1. Sign Up Caregiver
        cg_signup_res = await ac.post("/api/v1/auth/signup", json={
            "email": "caregiver@test.com",
            "name": "John Caregiver",
            "password": "securepassword123",
            "role": "caregiver"
        })
        assert cg_signup_res.status_code == 201
        cg_data = cg_signup_res.json()
        cg_id = cg_data["id"]
        
        # 2. Sign Up Patient (linking to Caregiver)
        pat_signup_res = await ac.post("/api/v1/auth/signup", json={
            "email": "patient@test.com",
            "name": "Jane Patient",
            "password": "patientpassword123",
            "role": "patient",
            "link_user_id": cg_id
        })
        assert pat_signup_res.status_code == 201
        pat_data = pat_signup_res.json()
        patient_id = pat_data["id"]
        
        # Verify bidirectional association
        assert cg_id in pat_data["associated_user_ids"]
        
        # 3. Log In Patient
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "patient@test.com",
            "password": "patientpassword123"
        })
        assert login_res.status_code == 200
        token_data = login_res.json()
        assert "access_token" in token_data
        pat_token = token_data["access_token"]
        headers = {"Authorization": f"Bearer {pat_token}"}
        
        # 4. Fetch Patient Profile
        profile_res = await ac.get("/api/v1/user/profile", headers=headers)
        assert profile_res.status_code == 200
        profile_json = profile_res.json()
        assert profile_json["name"] == "Jane Patient"
        assert "profile" in profile_json
        
        # Update Profile Details (allergies, emergency contacts, home coordinates)
        update_profile_res = await ac.put("/api/v1/user/profile", headers=headers, json={
            "patient_id": patient_id,
            "emergency_contacts": [
                {"name": "John Caregiver", "phone": "+15550199", "relationship": "Caregiver"}
            ],
            "medical_history": ["Hypertension"],
            "allergies": ["Penicillin"],
            "home_address": {
                "address_text": "456 Silver Meadows Blvd, San Jose, CA",
                "latitude": 37.3382,
                "longitude": -121.8863
            }
        })
        assert update_profile_res.status_code == 200
        
        # 5. Create Medication Schedule
        med_res = await ac.post("/api/v1/scheduler/medicines", json={
            "patient_id": patient_id,
            "name": "Lisinopril",
            "visual_identifiers": {
                "shape": "Round",
                "color": "Pink"
            },
            "scheduled_times": ["Morning"],
            "custom_instructions": "Take after breakfast",
            "is_critical": True
        })
        assert med_res.status_code == 201
        med_data = med_res.json()
        med_id = med_data["medicine_id"]
        
        # Get Medication list
        get_meds_res = await ac.get(f"/api/v1/scheduler/medicines?patient_id={patient_id}")
        assert get_meds_res.status_code == 200
        assert len(get_meds_res.json()) >= 1
        
        # 6. Log Intake
        log_res = await ac.post("/api/v1/scheduler/log-intake", json={
            "patient_id": patient_id,
            "medicine_id": med_id,
            "scheduled_time_slot": "Morning",
            "status": "completed"
        })
        assert log_res.status_code == 200
        assert log_res.json()["log"]["status"] == "completed"
        
        # 7. Clinic Queue Management
        # Join queue
        join_q = await ac.post(f"/api/v1/queue/add?patient_id={patient_id}")
        assert join_q.status_code == 201
        ticket = join_q.json()["ticket_number"]
        
        # Check queue status
        q_status = await ac.get(f"/api/v1/queue/status?patient_id={patient_id}")
        assert q_status.status_code == 200
        assert q_status.json()["user_number"] == ticket
        
        # Advance clinic queue
        adv_q = await ac.post("/api/v1/queue/advance")
        assert adv_q.status_code == 200
        
        # 8. AI food-drug interactions
        ai_res = await ac.post("/api/v1/ai/food-interaction", json={
            "patient_id": patient_id,
            "query": "Can I eat grapefruit?"
        })
        assert ai_res.status_code == 200
        assert "safety_warning" in ai_res.json()
        
        # 9. Navigation Link Home
        nav_res = await ac.get(f"/api/v1/navigation/home-route?patient_id={patient_id}")
        assert nav_res.status_code == 200
        assert "navigation_url" in nav_res.json()
        assert "37.3382" in nav_res.json()["navigation_url"]
        
        # 10. Visit Summary Doctor Brief Compilation
        summary_res = await ac.post("/api/v1/visit/generate-summary", json={
            "patient_id": patient_id,
            "transcript": "I felt dizzy this morning around 9am and had a mild headache. It went away after resting."
        })
        assert summary_res.status_code == 200
        assert "Doctor Brief" in summary_res.json()["summary"]
        
        # 11. Caregiver Dashboard
        # Log In Caregiver
        cg_login = await ac.post("/api/v1/auth/login", json={
            "email": "caregiver@test.com",
            "password": "securepassword123"
        })
        cg_token = cg_login.json()["access_token"]
        cg_headers = {"Authorization": f"Bearer {cg_token}"}
        
        dash_res = await ac.get(f"/api/v1/caregiver/dashboard?patient_id={patient_id}", headers=cg_headers)
        assert dash_res.status_code == 200
        dash_data = dash_res.json()
        assert dash_data["patient_name"] == "Jane Patient"
        assert dash_data["compliance_stats"]["compliance_rate"] == 100.0
        assert len(dash_data["recent_journals"]) >= 1
