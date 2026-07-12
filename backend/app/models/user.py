from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

class UserRole(str, Enum):
    PATIENT = "patient"
    CAREGIVER = "caregiver"

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole
    associated_user_ids: List[str] = Field(default_factory=list, description="IDs of linked patients or caregivers")

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: UserRole
    # For signup, allow passing an initial caregiver or patient to link to
    link_user_id: Optional[str] = None
    patient_id: Optional[str] = None
    
    # Optional patient/caregiver fields
    preferred_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    primary_conditions: Optional[List[str]] = None
    mental_disabilities: Optional[List[str]] = None
    physical_disabilities: Optional[List[str]] = None
    lifetime_medications: Optional[str] = None
    physician_name: Optional[str] = None
    clinic_phone: Optional[str] = None
    emergency_contacts: Optional[List[dict]] = None
    allergies: Optional[List[str]] = None
    home_address: Optional[dict] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    role: UserRole
    name: str
    patient_id: Optional[str] = None

class UserResponse(UserBase):
    id: str = Field(alias="_id")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "email": "user@silvercare.com",
                "name": "Jane Doe",
                "role": "patient",
                "associated_user_ids": ["507f1f77bcf86cd799439012"]
            }
        }
    }
