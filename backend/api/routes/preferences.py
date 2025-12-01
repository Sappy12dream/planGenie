from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from typing import Optional

from api.schemas.notification_schemas import (
    UserPreferencesResponse,
    UserPreferencesUpdateRequest
)
from services.supabase_service import get_supabase_client
from services.auth_service import get_user_from_token

router = APIRouter(prefix="/api/preferences", tags=["preferences"])

@router.get("/", response_model=UserPreferencesResponse)
async def get_preferences(
    supabase: Client = Depends(get_supabase_client),
    user_id: str = Depends(get_user_from_token),
):
    """Get user preferences, creating defaults if they don't exist"""
    try:
        # Try to get existing preferences
        result = supabase.table("user_preferences").select("*").eq("user_id", user_id).execute()
        
        if result.data:
            return UserPreferencesResponse(**result.data[0])
            
        # Create defaults if not found
        default_prefs = {
            "user_id": user_id,
            "email_notifications": True,
            "task_reminders": True,
            "weekly_digest": False,
            "reminder_time_hours": 24,
            "digest_day_of_week": 0
        }
        
        insert_result = supabase.table("user_preferences").insert(default_prefs).execute()
        
        if not insert_result.data:
            raise HTTPException(status_code=500, detail="Failed to create default preferences")
            
        return UserPreferencesResponse(**insert_result.data[0])
        
    except Exception as e:
        print(f"Error fetching preferences: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/", response_model=UserPreferencesResponse)
async def update_preferences(
    request: UserPreferencesUpdateRequest,
    supabase: Client = Depends(get_supabase_client),
    user_id: str = Depends(get_user_from_token),
):
    """Update user preferences"""
    try:
        # Ensure record exists first
        await get_preferences(supabase, user_id)
        
        update_data = request.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
            
        result = supabase.table("user_preferences").update(update_data).eq("user_id", user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to update preferences")
            
        return UserPreferencesResponse(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating preferences: {e}")
        raise HTTPException(status_code=500, detail=str(e))
