"""App configuration loaded from environment variables."""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Telegram
    BOT_TOKEN: str = "YOUR_BOT_TOKEN_HERE"

    # Database (SQLite for dev, PostgreSQL for prod)
    DATABASE_URL: str = "sqlite:///./foxdonat.db"
    # DATABASE_URL: str = "postgresql://user:pass@localhost/foxdonat"

    # App
    DEBUG: bool = True
    SECRET_KEY: str = "change-me-in-production"

    # Payment providers
    PAYME_MERCHANT_ID: Optional[str] = None
    PAYME_SECRET_KEY: Optional[str] = None
    CLICK_MERCHANT_ID: Optional[str] = None
    CLICK_SECRET_KEY: Optional[str] = None

    # Game API providers
    SMILEONE_MERCHANT_CODE: Optional[str] = None
    SMILEONE_MERCHANT_KEY: Optional[str] = None
    MIDASBUY_PARTNER_ID: Optional[str] = None
    MIDASBUY_SECRET: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
