import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import (
    auth_router,
    user_router,
    queue_router,
    visit_router,
    scheduler_router,
    caregiver_router,
    ai_router,
    navigation_router,
)
from app.routes.domain import router as domain_router
from app.routes.patients import router as patients_router
from app.routes.visits import router as visits_router
from app.routes.compliance import router as compliance_router

# Configure logging format
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()],
)
logger = logging.getLogger("silvercare.main")

# Initialize FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS Configuration - essential for React/Tailwind frontend integrations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all blueprints under /api/v1 prefix
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(user_router, prefix=settings.API_V1_STR)
app.include_router(queue_router, prefix=settings.API_V1_STR)
app.include_router(visit_router, prefix=settings.API_V1_STR)
app.include_router(scheduler_router, prefix=settings.API_V1_STR)
app.include_router(caregiver_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(navigation_router, prefix=settings.API_V1_STR)
app.include_router(domain_router, prefix=settings.API_V1_STR)
app.include_router(patients_router, prefix=settings.API_V1_STR)
app.include_router(visits_router, prefix=settings.API_V1_STR)
app.include_router(compliance_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": f"Welcome to the {settings.PROJECT_NAME} API Service",
        "docs_url": "/docs",
        "status": "healthy"
    }

@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting up {settings.PROJECT_NAME} API server.")
    logger.info(f"API endpoints mounted at prefix: {settings.API_V1_STR}")
    logger.info(f"Environment Mode settings: MOCK_MODE={settings.MOCK_MODE}")
