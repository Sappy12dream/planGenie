from fastapi import APIRouter, Depends, HTTPException, status, Header
from supabase import Client
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

from services.supabase_service import get_supabase_client
from services.chat_ai_service import get_chat_response
from services.auth_service import get_user_from_token

router = APIRouter(prefix="/api/chat", tags=["chat"])

class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)

class ChatMessage(BaseModel):
    id: str
    plan_id: str
    role: str
    content: str
    created_at: str

class ChatResponse(BaseModel):
    message: ChatMessage
    suggested_actions: Optional[List[dict]] = None

def verify_plan_ownership(supabase: Client, plan_id: str, user_id: str):
    """Verify that the plan belongs to the user"""
    try:
        plan_result = supabase.table("plans").select("user_id").eq("id", plan_id).execute()
        
        if not plan_result.data or len(plan_result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plan not found"
            )
        
        if plan_result.data[0]["user_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this plan"
            )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error verifying plan ownership: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error verifying plan ownership: {str(e)}"
        )

@router.post("/plans/{plan_id}/messages", response_model=ChatResponse)
async def send_message(
    plan_id: str,
    request: ChatMessageRequest,
    supabase: Client = Depends(get_supabase_client),
    user_id: str = Depends(get_user_from_token)
):
    """Send a message to AI and get response"""
    try:
        verify_plan_ownership(supabase, plan_id, user_id)
        
        plan_result = supabase.table("plans").select("*").eq("id", plan_id).execute()
        plan = plan_result.data[0]
        
        tasks_result = supabase.table("tasks").select("*").eq("plan_id", plan_id).order("order").execute()
        tasks = tasks_result.data
        
        history_result = supabase.table("messages").select("*").eq("plan_id", plan_id).order("created_at", desc=False).limit(10).execute()
        chat_history = history_result.data
        
        user_message_data = {
            "plan_id": plan_id,
            "role": "user",
            "content": request.message
        }
        user_msg_result = supabase.table("messages").insert(user_message_data).execute()
        
        ai_response = get_chat_response(
            user_message=request.message,
            plan=plan,
            tasks=tasks,
            chat_history=chat_history
        )
        
        ai_message_data = {
            "plan_id": plan_id,
            "role": "assistant",
            "content": ai_response["content"]
        }
        ai_msg_result = supabase.table("messages").insert(ai_message_data).execute()
        
        return ChatResponse(
            message=ChatMessage(**ai_msg_result.data[0]),
            suggested_actions=ai_response.get("suggested_actions")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in chat: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process message: {str(e)}"
        )

@router.get("/plans/{plan_id}/messages", response_model=List[ChatMessage])
async def get_messages(
    plan_id: str,
    supabase: Client = Depends(get_supabase_client),
    user_id: str = Depends(get_user_from_token)
):
    """Get all messages for a plan"""
    try:
        verify_plan_ownership(supabase, plan_id, user_id)
        
        result = supabase.table("messages").select("*").eq("plan_id", plan_id).order("created_at", desc=False).execute()
        
        return [ChatMessage(**msg) for msg in result.data]
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching messages: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch messages: {str(e)}"
        )
