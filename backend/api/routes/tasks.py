from fastapi import APIRouter, Depends, HTTPException, status, Header
from supabase import Client
from typing import List

from api.schemas.task_schemas import (
    TaskCreateRequest,
    TaskUpdateRequest,
    TaskBulkReorderRequest
)
from api.schemas.plan_schemas import TaskResponse
from services.supabase_service import get_supabase_client
from services.auth_service import get_user_from_token
from services.monitoring_service import MonitoringService

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

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
        MonitoringService.capture_exception(e, {"user_id": user_id, "action": "verify_plan_ownership", "plan_id": plan_id})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error verifying plan ownership: {str(e)}"
        )

def verify_task_ownership(supabase: Client, task_id: str, user_id: str) -> str:
    """Verify that the task belongs to the user and return plan_id"""
    try:
        task_result = supabase.table("tasks").select("plan_id").eq("id", task_id).execute()
        
        if not task_result.data or len(task_result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Task not found: {task_id}"
            )
        
        plan_id = task_result.data[0]["plan_id"]
        verify_plan_ownership(supabase, plan_id, user_id)
        
        return plan_id
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error verifying task ownership: {e}")
        MonitoringService.capture_exception(e, {"user_id": user_id, "action": "verify_task_ownership", "task_id": task_id})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error verifying task ownership: {str(e)}"
        )

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    plan_id: str,
    request: TaskCreateRequest,
    supabase: Client = Depends(get_supabase_client),
    user_id: str = Depends(get_user_from_token)
):
    """Create a new task in a plan"""
    try:
        verify_plan_ownership(supabase, plan_id, user_id)
        
        existing_tasks = supabase.table("tasks").select("order").eq("plan_id", plan_id).execute()
        max_order = max([task["order"] for task in existing_tasks.data], default=-1)
        
        task_data = {
            "plan_id": plan_id,
            "title": request.title,
            "description": request.description,
            "status": "pending",
            "due_date": request.due_date.isoformat() if request.due_date else None,
            "order": max_order + 1
        }
        
        result = supabase.table("tasks").insert(task_data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create task"
            )
        
        return TaskResponse(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating task: {e}")
        MonitoringService.capture_exception(e, {"user_id": user_id, "action": "create_task", "plan_id": plan_id})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create task: {str(e)}"
        )

@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    request: TaskUpdateRequest,
    supabase: Client = Depends(get_supabase_client),
    user_id: str = Depends(get_user_from_token)
):
    """Update a task"""
    try:
        plan_id = verify_task_ownership(supabase, task_id, user_id)
        
        update_data = {}
        if request.title is not None:
            update_data["title"] = request.title
        if request.description is not None:
            update_data["description"] = request.description
        if request.status is not None:
            update_data["status"] = request.status
        if request.due_date is not None:
            update_data["due_date"] = request.due_date.isoformat()
        if request.order is not None:
            update_data["order"] = request.order
        
        # AI Intelligence Metadata fields
        if request.estimated_time_hours is not None:
            update_data["estimated_time_hours"] = request.estimated_time_hours
        if request.difficulty is not None:
            update_data["difficulty"] = request.difficulty
        if request.estimated_cost_usd is not None:
            update_data["estimated_cost_usd"] = request.estimated_cost_usd
        if request.tools_needed is not None:
            update_data["tools_needed"] = request.tools_needed
        if request.prerequisites is not None:
            update_data["prerequisites"] = request.prerequisites
        if request.tags is not None:
            update_data["tags"] = request.tags
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        result = supabase.table("tasks").update(update_data).eq("id", task_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found or update failed"
            )
            
        # Track task completion if status changed to completed
        if request.status == "completed":
            MonitoringService.track_task_completed(user_id, task_id, plan_id)
        
        return TaskResponse(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating task: {e}")
        MonitoringService.capture_exception(e, {"user_id": user_id, "action": "update_task", "task_id": task_id})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update task: {str(e)}"
        )

@router.delete("/{task_id}", status_code=status.HTTP_200_OK)
async def delete_task(
    task_id: str,
    supabase: Client = Depends(get_supabase_client),
    user_id: str = Depends(get_user_from_token)
):
    """Delete a task"""
    try:
        verify_task_ownership(supabase, task_id, user_id)
        
        result = supabase.table("tasks").delete().eq("id", task_id).execute()
        
        return {"message": "Task deleted successfully", "id": task_id}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting task: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete task: {str(e)}"
        )

@router.post("/reorder", status_code=status.HTTP_200_OK)
async def reorder_tasks(
    request: TaskBulkReorderRequest,
    supabase: Client = Depends(get_supabase_client),
    user_id: str = Depends(get_user_from_token)
):
    """Reorder multiple tasks at once"""
    try:
        for task_order in request.tasks:
            verify_task_ownership(supabase, task_order.task_id, user_id)
        
        for task_order in request.tasks:
            supabase.table("tasks").update({
                "order": task_order.new_order
            }).eq("id", task_order.task_id).execute()
        
        return {"message": "Tasks reordered successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error reordering tasks: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reorder tasks: {str(e)}"
        )
