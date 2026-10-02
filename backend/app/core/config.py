from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "E-Find & Soft Solutions"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Secret Key & Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite+aiosqlite:///{BASE_DIR / 'efind.db'}"
    )
    
    # File Storage: GCS or Local
    USE_GCS: bool = os.getenv("USE_GCS", "false").lower() == "true"
    GCS_BUCKET_NAME: Optional[str] = os.getenv("GCS_BUCKET_NAME", "efind-uploads")
    GCS_CREDENTIALS_FILE: Optional[str] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", None)
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", str(BASE_DIR / "uploads"))
    
    # Pesapal API v3
    PESAPAL_CONSUMER_KEY: str = os.getenv("PESAPAL_CONSUMER_KEY", "sample_consumer_key")
    PESAPAL_CONSUMER_SECRET: str = os.getenv("PESAPAL_CONSUMER_SECRET", "sample_consumer_secret")
    PESAPAL_ENV: str = os.getenv("PESAPAL_ENV", "sandbox")  # "sandbox" or "live"
    PESAPAL_IPN_ID: Optional[str] = os.getenv("PESAPAL_IPN_ID", None)
    PESAPAL_CALLBACK_URL: str = os.getenv("PESAPAL_CALLBACK_URL", "http://localhost:3000/payment/callback")
    
    # MTN MoMo API (Collections)
    MTN_MOMO_SUBSCRIPTION_KEY: str = os.getenv("MTN_MOMO_SUBSCRIPTION_KEY", "")
    MTN_MOMO_API_USER_ID: str = os.getenv("MTN_MOMO_API_USER_ID", "")
    MTN_MOMO_API_KEY: str = os.getenv("MTN_MOMO_API_KEY", "")
    MTN_MOMO_ENV: str = os.getenv("MTN_MOMO_ENV", "sandbox")  # "sandbox" or "live"
    MTN_MOMO_TARGET_ENV: str = os.getenv("MTN_MOMO_TARGET_ENV", "sandbox")  # "sandbox" or "mtnuganda"
    MTN_MOMO_CURRENCY: str = os.getenv("MTN_MOMO_CURRENCY", "UGX")
    MTN_MOMO_CALLBACK_URL: Optional[str] = os.getenv("MTN_MOMO_CALLBACK_URL", None)

    # Mapbox
    MAPBOX_PUBLIC_TOKEN: str = os.getenv("NEXT_PUBLIC_MAPBOX_TOKEN", "")

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"), 
        extra="ignore"
    )

settings = Settings()

