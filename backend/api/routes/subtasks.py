from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from typing import List

from api.schemas.subtask_schemas import (
    SubtaskCreateRequest,
    SubtaskUpdateRequest,
    SubtaskResponse,
    SubtaskGenerateRequest
)
from services.supabase_service import get_supabase_client
from services.auth_service import get_user_from_token
from services.subtask_generator import generate_subtasks_with_ai

router = APIRouter(prefix="/api/subtasks", tags=["subtasks"])

def verify_task_ownership(supabase: Client, task_id: str, user_id: str):
    """Verify that the task belongs to the user"""
    try:
        task_result = supabase.table("tasks").select("plan_id").eq("id", task_id).execute()
        
        if not task_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        plan_id = task_result.data[0]["plan_id"]
        plan_result = supabase.table("plans").select("user_id").eq("id", plan_id).execute()
        
        if not plan_result.data or plan_result.data[0]["user_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this task"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error verifying task ownership: {str(e)}"
        )

@router.get("/tasks/{task_id}", response_model=List[SubtaskResponse])
async def get_subtasks(
    task_id: str,
    supabase: Client = Depends(get_supabase_client),
    user_id: str = Depends(get_user_from_token)
):
    """Get all subtasks for a task"""
    try:
        verify_task_ownership(supabase, task_id, user_id)
        
        result = supabase.table("subtasks").select("*").eq("task_id", task_id).order("order").execute()
        
        return [SubtaskResponse(**subtask) for subtask in result.data]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch subtasks: {str(e)}"
        )

@router.post("/", response_model=SubtaskResponse, status_code=status.HTTP_201_CREATED)
async def create_subtask(
    task_id: str,
    request: SubtaskCreateRequest,
    supabase: Client = Depends(get_supabase_client),
    user_id: str = Depends(get_user_from_token)
):
    """Create a new subtask"""
    try:
        verify_task_ownership(supabase, task_id, user_id)
        
        existing = supabase.table("subtasks").select("order").eq("task_id", task_id).execute()
        max_order = max([st["order"] for st in existing.data], default=-1)
        
        subtask_data = {
            "task_id": task_id,
            "title": request.title,
            "description": request.description,
            "status": "pending",
            "order": max_order + 1
        }
        
        result = supabase.table("subtasks").insert(subtask_data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create subtask"
            )
        
        return SubtaskResponse(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create subtask: {str(e)}"
        )

@router.patch("/{subtask_id}", response_model=SubtaskResponse)
async def update_subtask(
    subtask_id: str,
    request: SubtaskUpdateRequest,
    supabase: Client = Depends(get_supabase_client),
    user_id: str = Depends(get_user_from_token)
):
    """Update a subtask"""
    try:
        # Get subtask to verify ownership
        subtask_result = supabase.table("subtasks").select("task_id").eq("id", subtask_id).execute()
        
        if not subtask_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subtask not found"
            )
        
        task_id = subtask_result.data[0]["task_id"]
        verify_task_ownership(supabase, task_id, user_id)
        
        update_data = {}
        if request.title is not None:
            update_data["title"] = request.title
        if request.description is not None:
            update_data["description"] = request.description
        if request.status is not None:
            update_data["status"] = request.status
        if request.order is not None:
            update_data["order"] = request.order
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        result = supabase.table("subtasks").update(update_data).eq("id", subtask_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subtask not found"
            )
        
        return SubtaskResponse(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update subtask: {str(e)}"
        )

@router.delete("/{subtask_id}", status_code=status.HTTP_200_OK)
async def delete_subtask(
    subtask_id: str,
    supabase: Client = Depends(get_supabase_client),
    user_id: str = Depends(get_user_from_token)
):
    """Delete a subtask"""
    try:
        # Get subtask to verify ownership
        subtask_result = supabase.table("subtasks").select("task_id").eq("id", subtask_id).execute()
        
        if not subtask_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subtask not found"
            )
        
        task_id = subtask_result.data[0]["task_id"]
        verify_task_ownership(supabase, task_id, user_id)
        
        supabase.table("subtasks").delete().eq("id", subtask_id).execute()
        
        return {"message": "Subtask deleted successfully", "id": subtask_id}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete subtask: {str(e)}"
        )

@router.post("/generate", response_model=List[SubtaskResponse], status_code=status.HTTP_201_CREATED)
async def generate_subtasks(
    request: SubtaskGenerateRequest,
    supabase: Client = Depends(get_supabase_client),
    user_id: str = Depends(get_user_from_token)
):
    """Generate subtasks for a task using AI"""
    try:
        verify_task_ownership(supabase, request.task_id, user_id)
        
        # Generate subtasks with AI
        ai_subtasks = generate_subtasks_with_ai(
            task_title=request.task_title,
            task_description=request.task_description or ""
        )
        
        # Insert subtasks
        subtasks_data = []
        for i, subtask in enumerate(ai_subtasks):
            subtasks_data.append({
                "task_id": request.task_id,
                "title": subtask["title"],
                "description": subtask.get("description"),
                "status": "pending",
                "order": i
            })
        
        result = supabase.table("subtasks").insert(subtasks_data).execute()
        
        return [SubtaskResponse(**st) for st in result.data]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate subtasks: {str(e)}"
        )
