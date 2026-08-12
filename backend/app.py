# All imports first
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from typing import List, Dict, Any, Optional  
from datetime import datetime
import numpy as np

from config import Config
from models import EnrollmentPayload, KeystrokePayload, User, BiometricProfile, DwellTimeStats, FlightTimeStats
from biometrics import KeystrokeAnalyzer
from auth import PasswordHandler

# Initialize FastAPI app FIRST - before any route decorators
app = FastAPI(title="BioKey API", description="Keystroke Dynamics Authentication Engine")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
client = MongoClient(Config.MONGODB_URL)
db = client[Config.DATABASE_NAME]
users_collection = db["users"]

# Startup event
@app.on_event("startup")
async def startup_db_client():
    # Create indexes for better performance
    users_collection.create_index("username", unique=True)
    print(f"✅ Connected to MongoDB at {Config.MONGODB_URL}")
    print(f"✅ Database: {Config.DATABASE_NAME}")
    print(f"✅ Target phrase: {Config.TARGET_PHRASE}")
    print(f"✅ Required repetitions: {Config.REQUIRED_REPETITIONS}")
    print(f"✅ Auth threshold: {Config.AUTH_THRESHOLD}")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    print("✅ MongoDB connection closed")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "target_phrase": Config.TARGET_PHRASE,
        "required_repetitions": Config.REQUIRED_REPETITIONS,
        "auth_threshold": Config.AUTH_THRESHOLD,
        "mongodb_connected": True
    }

# Root endpoint for API info
@app.get("/")
async def root():
    return {
        "name": "BioKey API",
        "version": "1.0.0",
        "description": "Keystroke Dynamics Authentication Engine",
        "endpoints": {
            "health": "/health",
            "enroll": "/api/auth/enroll (POST)",
            "login": "/api/auth/login (POST)",
            "status": "/api/auth/status/{username} (GET)"
        }
    }

# Enrollment endpoint
@app.post("/api/auth/enroll")
async def enroll_user(payload: EnrollmentPayload):
    """Enroll a new user with biometric profile"""
    
    # Check if user exists
    existing_user = users_collection.find_one({"username": payload.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    # Validate repetitions count - UPDATED TO 7
    REQUIRED_REPETITIONS = 7
    if len(payload.repetitions) != REQUIRED_REPETITIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Exactly {REQUIRED_REPETITIONS} typing repetitions required, got {len(payload.repetitions)}"
        )
    
    # Extract biometric profile from repetitions
    try:
        profile_data = KeystrokeAnalyzer.extract_profile_from_repetitions(payload.repetitions)
        
        # Convert to database format map safely
        dwell_means = [DwellTimeStats(key=k, mean_ms=v, std_ms=0) for k, v in profile_data['dwell_means'].items()]
        dwell_stddevs = [DwellTimeStats(key=k, mean_ms=0, std_ms=profile_data['dwell_stddevs'].get(k, 0.1)) for k, v in profile_data['dwell_means'].items()]
        
        # Fixed parameter keyword definition from key -> key_pair to match your FlightTimeStats model layout
        flight_means = [FlightTimeStats(key_pair=k, mean_ms=v, std_ms=0) for k, v in profile_data['flight_means'].items()]
        flight_stddevs = [FlightTimeStats(key_pair=k, mean_ms=0, std_ms=profile_data['flight_stddevs'].get(k, 0.1)) for k, v in profile_data['flight_means'].items()]
        
        biometric_profile = BiometricProfile(
            target_phrase=Config.TARGET_PHRASE,
            dwell_time_means=dwell_means,
            dwell_time_stddevs=dwell_stddevs,
            flight_time_means=flight_means,
            flight_time_stddevs=flight_stddevs
        )
        
        # Create user document
        user_doc = {
            "username": payload.username,
            "password_hash": PasswordHandler.hash_password(payload.password),
            "is_enrolled": True,
            "biometric_profile": biometric_profile.dict(),
            "created_at": datetime.utcnow()
        }
        
        result = users_collection.insert_one(user_doc)
        
        return {
            "success": True,
            "message": f"Enrollment completed successfully with {REQUIRED_REPETITIONS} repetitions",
            "user_id": str(result.inserted_id)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process biometric profile: {str(e)}"
        )

# Login/Authentication endpoint
@app.post("/api/auth/login")
async def verify_user(payload: KeystrokePayload):
    """Authenticate user with password and keystroke dynamics"""
    
    # Find user
    user = users_collection.find_one({"username": payload.username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Verify password hash first
    if not PasswordHandler.verify_password(payload.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Check if user is enrolled
    if not user.get("is_enrolled", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not enrolled. Please complete enrollment first."
        )
    
    # Verify phrase matches
    if payload.phrase != Config.TARGET_PHRASE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Please type the correct phrase: {Config.TARGET_PHRASE}"
        )
    
    # Extract live biometric profile
    try:
        live_profile = KeystrokeAnalyzer.extract_live_profile([k.dict() for k in payload.keystrokes])
        
        # Get baseline profile
        baseline = user["biometric_profile"]
        
        # Convert baseline to simple dict format
        baseline_profile = {
            'dwell_means': {item['key']: item['mean_ms'] for item in baseline['dwell_time_means']},
            'flight_means': {item['key_pair']: item['mean_ms'] for item in baseline['flight_time_means']}
        }
        
        # Calculate similarity score
        similarity_score = KeystrokeAnalyzer.compute_similarity_score(live_profile, baseline_profile)
        
        # Determine if authenticated
        is_authenticated = similarity_score >= Config.AUTH_THRESHOLD
        
        # Prepare comparison data for dashboard
        comparison_data = {
            'dwell_times': {
                'live': live_profile['dwell_means'],
                'baseline': baseline_profile['dwell_means']
            },
            'flight_times': {
                'live': live_profile['flight_means'],
                'baseline': baseline_profile['flight_means']
            }
        }
        
        return {
            "authenticated": is_authenticated,
            "similarity_score": round(similarity_score * 100, 2),
            "message": "Authentication successful" if is_authenticated else "Biometric verification failed",
            "comparison_data": comparison_data
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Biometric verification failed: {str(e)}"
        )

# Get user enrollment status endpoint
@app.get("/api/auth/status/{username}")
async def get_user_status(username: str):
    """Check if a user is enrolled"""
    
    user = users_collection.find_one({"username": username})
    if not user:
        return {"exists": False, "is_enrolled": False}
    
    return {
        "exists": True,
        "is_enrolled": user.get("is_enrolled", False),
        "username": user["username"]
    }

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
    