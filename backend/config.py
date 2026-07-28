import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME = os.getenv("DATABASE_NAME", "biokey_db")
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
    TARGET_PHRASE = os.getenv("TARGET_PHRASE", "biokey.sequence.2026")
    AUTH_THRESHOLD = float(os.getenv("AUTH_THRESHOLD", "0.7"))
    REQUIRED_REPETITIONS = int(os.getenv("REQUIRED_REPETITIONS", "7"))
    
    # Anomaly detection threshold (higher = stricter)
    ANOMALY_THRESHOLD = float(os.getenv("ANOMALY_THRESHOLD", "0.3"))