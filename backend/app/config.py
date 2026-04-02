"""Application configuration loaded from environment variables."""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Central configuration for the Datafle backend."""

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./datafle.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fallback-secret-key")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
    )
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    EXCHANGE_API_KEY: str = os.getenv("EXCHANGE_API_KEY", "")
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


settings = Settings()
