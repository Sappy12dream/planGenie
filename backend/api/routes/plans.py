from fastapi import APIRouter, Depends, HTTPException, status, Header
from supabase import Client
from typing import List
from datetime import datetime
import uuid

from api.schemas.plan_schemas import (
    PlanGenerateRequest,
    PlanGenerateResponse,
    PlanResponse,
    TaskResponse,
    ResourceResponse,
)
from services.supabase_service import get_supabase_client
from services.plan_generator import generate_plan_with_ai
from services.auth_service import get_user_from_token

router = APIRouter(prefix="/api/plans", tags=["plans"])


@router.get("/", response_model=List[PlanResponse])
async def get_all_plans(
    status: str = None,
    supabase: Client = Depends(get_supabase_client),
    user_id: str = Depends(get_user_from_token),
):
    """
    Get all plans for the current user
    Optional filter by status
    """
    try:
        # Build query
        query = (
            supabase.table("plans")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
        )

        # Filter by status if provided
        if status:
            query = query.eq("status", status)

        plans_result = query.execute()

        # Get tasks and resources for each plan
        plans_with_details = []
        for plan in plans_result.data:
            plan_id = plan["id"]

            # Get tasks
            tasks_result = (
                supabase.table("tasks")
                .select("*")
                .eq("plan_id", plan_id)
                .order("order")
                .execute()
            )

            # Get resources
            resources_result = (
                supabase.table("resources").select("*").eq("plan_id", plan_id).execute()
            )

            plan_response = PlanResponse(
                id=plan["id"],
                user_id=plan["user_id"],
                title=plan["title"],
                description=plan["description"],
                status=plan["status"],
                tasks=[TaskResponse(**task) for task in tasks_result.data],
                resources=[
                    ResourceResponse(**resource) for resource in resources_result.data
                ],
                created_at=plan["created_at"],
                updated_at=plan["updated_at"],
            )
            plans_with_details.append(plan_response)

        return plans_with_details

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching plans: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch plans: {str(e)}",
        )


@router.post(
    "/generate",
    response_model=PlanGenerateResponse,
    status_code=status.HTTP_201_CREATED,
)
async def generate_plan(
    request: PlanGenerateRequest,
    supabase: Client = Depends(get_supabase_client),
    user_id: str = Depends(get_user_from_token),
):
    """
    Generate a new plan using AI

    - Calls OpenAI to generate tasks and resources
    - Saves plan, tasks, and resources to database
    - Returns complete plan structure
    """

    try:
        # Generate plan using AI
        print(f"Generating plan for: {request.title}")
        ai_response = generate_plan_with_ai(
            title=request.title,
            description=request.description,
            timeline=request.timeline,
        )

        # Create plan in database
        plan_data = {
            "user_id": user_id,
            "title": request.title,
            "description": request.description,
            "status": "active",
        }

        plan_result = supabase.table("plans").insert(plan_data).execute()

        if not plan_result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create plan",
            )

        plan = plan_result.data[0]
        plan_id = plan["id"]

        # Insert tasks
        tasks_data = []
        for task in ai_response["tasks"]:
            tasks_data.append(
                {
                    "plan_id": plan_id,
                    "title": task["title"],
                    "description": task.get("description", ""),
                    "status": "pending",
                    "order": task.get("order", 0),
                }
            )

        tasks_result = supabase.table("tasks").insert(tasks_data).execute()

        # Insert resources
        resources_data = []
        for resource in ai_response["resources"]:
            resources_data.append(
                {
                    "plan_id": plan_id,
                    "title": resource["title"],
                    "url": resource["url"],
                    "type": resource.get("type", "link"),
                }
            )

        resources_result = supabase.table("resources").insert(resources_data).execute()

        # Build response
        response = PlanGenerateResponse(
            plan=PlanResponse(
                id=plan["id"],
                user_id=plan["user_id"],
                title=plan["title"],
                description=plan["description"],
                status=plan["status"],
                tasks=[TaskResponse(**task) for task in tasks_result.data],
                resources=[
                    ResourceResponse(**resource) for resource in resources_result.data
                ],
                created_at=plan["created_at"],
                updated_at=plan["updated_at"],
            )
        )

        return response

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating plan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate plan: {str(e)}",
        )


@router.get("/{plan_id}", response_model=PlanResponse)
async def get_plan(
    plan_id: str,
    supabase: Client = Depends(get_supabase_client),
    user_id: str = Depends(get_user_from_token),
):
    """Get a plan by ID with all tasks and resources"""

    try:
        # Get plan (RLS will automatically filter by user)
        plan_result = supabase.table("plans").select("*").eq("id", plan_id).execute()

        if not plan_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found"
            )

        plan = plan_result.data[0]

        # Verify ownership
        if plan["user_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this plan",
            )

        # Get tasks
        tasks_result = (
            supabase.table("tasks")
            .select("*")
            .eq("plan_id", plan_id)
            .order("order")
            .execute()
        )

        # Get resources
        resources_result = (
            supabase.table("resources").select("*").eq("plan_id", plan_id).execute()
        )

        # Build response
        response = PlanResponse(
            id=plan["id"],
            user_id=plan["user_id"],
            title=plan["title"],
            description=plan["description"],
            status=plan["status"],
            tasks=[TaskResponse(**task) for task in tasks_result.data],
            resources=[
                ResourceResponse(**resource) for resource in resources_result.data
            ],
            created_at=plan["created_at"],
            updated_at=plan["updated_at"],
        )

        return response

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching plan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch plan: {str(e)}",
        )


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plan(
    plan_id: str,
    supabase: Client = Depends(get_supabase_client),
    user_id: str = Depends(get_user_from_token),
):
    """Delete a plan and all associated tasks/resources"""

    try:
        # Get plan to verify ownership
        plan_result = (
            supabase.table("plans").select("user_id").eq("id", plan_id).execute()
        )

        if not plan_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found"
            )

        if plan_result.data[0]["user_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this plan",
            )

        # Delete plan (cascade will delete tasks, resources, messages)
        supabase.table("plans").delete().eq("id", plan_id).execute()

        return None

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting plan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete plan: {str(e)}",
        )


@router.patch("/{plan_id}/status", response_model=PlanResponse)
async def update_plan_status(
    plan_id: str,
    status: str,
    supabase: Client = Depends(get_supabase_client),
    user_id: str = Depends(get_user_from_token),
):
    """Update plan status (archive, complete, etc)"""

    try:
        # Get plan to verify ownership
        plan_result = (
            supabase.table("plans").select("user_id").eq("id", plan_id).execute()
        )

        if not plan_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found"
            )

        if plan_result.data[0]["user_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this plan",
            )

        # Update status
        updated_plan = (
            supabase.table("plans")
            .update({"status": status})
            .eq("id", plan_id)
            .execute()
        )

        # Get full plan details
        return await get_plan(plan_id, supabase, user_id)

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating plan status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update plan status: {str(e)}",
        )
