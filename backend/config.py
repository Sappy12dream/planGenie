from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Supabase
    supabase_url: str
    supabase_service_role_key: str
    
    # OpenAI
    openai_api_key: str
    
    # App
    environment: str = "development"
    debug: bool = True
    frontend_url: str = "http://localhost:3004"

    # Sentry
    sentry_dsn: str | None = None
    sentry_traces_sample_rate: float = 1.0
    sentry_profiles_sample_rate: float = 1.0
    
    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings():
    """Get cached settings instance"""
    return Settings()

settings = get_settings()
