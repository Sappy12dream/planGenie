from openai import OpenAI
from config import get_settings

settings = get_settings()

def get_openai_client() -> OpenAI:
    """Get OpenAI client instance"""
    return OpenAI(api_key=settings.openai_api_key)
