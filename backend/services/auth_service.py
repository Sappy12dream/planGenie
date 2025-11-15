from fastapi import HTTPException, Header
from supabase import Client
from services.supabase_service import get_supabase_client
import jwt
from config import get_settings

settings = get_settings()

def get_user_from_token(authorization: str = Header(None)) -> str:
    """
    Extract user ID from Supabase JWT token
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    # Remove 'Bearer ' prefix
    token = authorization.replace('Bearer ', '')
    
    try:
        # Verify token with Supabase
        supabase = get_supabase_client()
        user = supabase.auth.get_user(token)
        
        if not user or not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return user.user.id
    
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")
