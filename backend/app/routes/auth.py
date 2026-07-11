import uuid
import logging
from datetime import datetime, timedelta
from typing import Optional
import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException, status, Header
from app.config import settings
from app.database import get_database
from app.models.user import UserCreate, UserLogin, Token, UserResponse, UserRole
from app.models.patient import PatientProfileCreate

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger("silvercare.routes.auth")

# Helper functions for encryption & token creation
def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    # Convert datetime to timestamp
    to_encode.update({"exp": int(expire.timestamp())})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

# Dependency to fetch the current user from JWT token
async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization Header"
        )
    
    try:
        token_type, token = authorization.split(" ")
        if token_type.lower() != "bearer":
            raise ValueError()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Use 'Bearer <token>'"
        )
        
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token is missing sub claim"
            )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token signature has expired"
        )
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}"
        )
        
    db = get_database()
    user = await db["users"].find_one({"_id": user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
        
    return user

@router.post("/signup", response_model=UserResponse, response_model_by_alias=False, status_code=status.HTTP_201_CREATED)
async def signup(user_in: UserCreate):
    db = get_database()
    
    # Check if user already exists
    existing_user = await db["users"].find_one({"email": user_in.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )
        
    # Generate unique ID
    new_user_id = str(uuid.uuid4())
    
    # Map associations if link_user_id is provided
    associated_ids = []
    if user_in.link_user_id:
        # Verify the linked user exists
        linked = await db["users"].find_one({"_id": user_in.link_user_id})
        if linked:
            associated_ids.append(user_in.link_user_id)
            # Bidirectional update of the linked user's associations
            await db["users"].update_one(
                {"_id": user_in.link_user_id},
                {"$push": {"associated_user_ids": new_user_id}}
            )
            
    # Hash password & construct user doc
    hashed_pwd = hash_password(user_in.password)
    user_doc = {
        "_id": new_user_id,
        "email": user_in.email,
        "name": user_in.name,
        "hashed_password": hashed_pwd,
        "role": user_in.role.value,
        "associated_user_ids": associated_ids
    }
    
    await db["users"].insert_one(user_doc)
    
    # If the role is PATIENT, automatically create an empty Patient Profile
    if user_in.role == UserRole.PATIENT:
        profile_doc = {
            "_id": str(uuid.uuid4()),
            "patient_id": new_user_id,
            "preferred_name": user_in.name,
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
        await db["patients"].insert_one(profile_doc)
        
    return user_doc

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    db = get_database()
    
    user = await db["users"].find_one({"email": credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
        
    if not verify_password(credentials.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
        
    access_token = create_access_token(data={"sub": user["_id"], "role": user["role"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user["_id"],
        "role": user["role"],
        "name": user["name"]
    }
