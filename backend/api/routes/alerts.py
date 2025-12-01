from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from typing import List
from datetime import datetime

from api.schemas.notification_schemas import (
    DashboardAlertResponse,
    AlertGenerateResponse
)
from services.supabase_service import get_supabase_client
from services.auth_service import get_user_from_token
from services.alert_engine_service import AlertEngineService

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

@router.get("/", response_model=List[DashboardAlertResponse])
async def get_active_alerts(
    supabase: Client = Depends(get_supabase_client),
    user_id: str = Depends(get_user_from_token),
):
    """Get active (undismissed) alerts for the user"""
    try:
        result = (
            supabase.table("dashboard_alerts")
            .select("*")
            .eq("user_id", user_id)
            .is_("dismissed_at", "null")
            .order("priority", desc=False) # 1 is high, 3 is low
            .order("created_at", desc=True)
            .execute()
        )
        
        return [DashboardAlertResponse(**alert) for alert in result.data]
        
    except Exception as e:
        print(f"Error fetching alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate", response_model=AlertGenerateResponse)
async def generate_alerts(
    supabase: Client = Depends(get_supabase_client),
    user_id: str = Depends(get_user_from_token),
):
    """Manually trigger alert generation for the user"""
    try:
        alerts = AlertEngineService.generate_alerts_for_user(supabase, user_id)
        AlertEngineService.save_alerts(supabase, alerts)
        
        return AlertGenerateResponse(
            message="Alerts generated successfully",
            count=len(alerts)
        )
        
    except Exception as e:
        print(f"Error generating alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{alert_id}/dismiss", status_code=status.HTTP_204_NO_CONTENT)
async def dismiss_alert(
    alert_id: str,
    supabase: Client = Depends(get_supabase_client),
    user_id: str = Depends(get_user_from_token),
):
    """Dismiss an alert"""
    try:
        # Verify ownership
        alert = supabase.table("dashboard_alerts").select("user_id").eq("id", alert_id).execute()
        if not alert.data or alert.data[0]["user_id"] != user_id:
            raise HTTPException(status_code=404, detail="Alert not found")
            
        # Mark as dismissed
        supabase.table("dashboard_alerts").update({
            "dismissed_at": datetime.now().isoformat()
        }).eq("id", alert_id).execute()
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error dismissing alert: {e}")
        raise HTTPException(status_code=500, detail=str(e))
