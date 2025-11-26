from fastapi import APIRouter, Depends, HTTPException, status, Header
from supabase import Client
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

from services.supabase_service import get_supabase_client
from services.chat_ai_service import get_chat_response
from services.auth_service import get_user_from_token
from services.chat_suggestion_service import (
    generate_proactive_suggestions,
    get_pending_suggestions,
    dismiss_suggestion,
    accept_suggestion
)
from api.schemas.chat_suggestion_schemas import ChatSuggestionResponse
from utils.rate_limiter import suggestion_rate_limiter


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

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify plan ownership"
        )

def verify_suggestion_ownership(supabase: Client, suggestion_id: str, user_id: str) -> str:
    """Verify that the suggestion belongs to a plan owned by the user. Returns plan_id."""
    try:
        # Get suggestion with plan info
        suggestion_result = supabase.table("chat_suggestions")\
            .select("plan_id")\
            .eq("id", suggestion_id)\
            .execute()
        
        if not suggestion_result.data or len(suggestion_result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Suggestion not found"
            )
        
        plan_id = suggestion_result.data[0]["plan_id"]
        
        # Verify plan ownership
        verify_plan_ownership(supabase, plan_id, user_id)
        
        return plan_id
    except HTTPException:
        raise
    except Exception as e:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify suggestion ownership"
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
        
        # Get plan and tasks in a single query (avoids N+1)
        plan_result = supabase.table("plans").select("*, tasks(*)").eq("id", plan_id).execute()
        plan = plan_result.data[0]
        tasks = plan.get("tasks", [])
        
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

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process message"
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

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch messages"
        )

@router.get("/plans/{plan_id}/suggestions", response_model=List[ChatSuggestionResponse])
async def get_suggestions(
    plan_id: str,
    refresh: bool = False,
    supabase: Client = Depends(get_supabase_client),
    user_id: str = Depends(get_user_from_token)
):
    """Get proactive suggestions for a plan. Optionally generate new ones."""
    try:
        verify_plan_ownership(supabase, plan_id, user_id)
        
        suggestions = get_pending_suggestions(plan_id, supabase)
        
        # If no suggestions or forced refresh, generate new ones
        if not suggestions or refresh:
            # Check rate limit
            if not suggestion_rate_limiter.is_allowed(user_id, plan_id):
                remaining = suggestion_rate_limiter.get_remaining(user_id, plan_id)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded. Try again later. Remaining: {remaining}"
                )
            
            # Fetch plan and tasks in a single query
            plan_result = supabase.table("plans").select("*, tasks(*)").eq("id", plan_id).execute()
            plan_data = plan_result.data[0] if plan_result.data else None
            tasks_data = plan_data.get("tasks", []) if plan_data else []
            
            if plan_data:
                new_suggestions = generate_proactive_suggestions(
                    plan_data,
                    tasks_data,
                    user_id,
                    supabase
                )
                # Combine existing (if any) with new
                suggestions.extend(new_suggestions)
                
        return [ChatSuggestionResponse(**s) for s in suggestions]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get suggestions"
        )

@router.post("/suggestions/{suggestion_id}/dismiss")
async def dismiss_suggestion_endpoint(
    suggestion_id: str,
    supabase: Client = Depends(get_supabase_client),
    user_id: str = Depends(get_user_from_token)
):
    """Dismiss a suggestion"""
    try:
        # Verify ownership
        verify_suggestion_ownership(supabase, suggestion_id, user_id)
        
        dismiss_suggestion(suggestion_id, supabase)

        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:

        raise HTTPException(status_code=500, detail="Failed to dismiss suggestion")

@router.post("/suggestions/{suggestion_id}/act")
async def act_on_suggestion_endpoint(
    suggestion_id: str,
    supabase: Client = Depends(get_supabase_client),
    user_id: str = Depends(get_user_from_token)
):
    """Accept and execute suggestion action"""
    try:
        # Verify ownership
        verify_suggestion_ownership(supabase, suggestion_id, user_id)
        
        accept_suggestion(suggestion_id, supabase)

        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:

        raise HTTPException(status_code=500, detail="Failed to execute suggestion action")
