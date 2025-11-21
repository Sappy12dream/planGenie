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
    PlanStatsResponse,
)
from services.supabase_service import get_supabase_client
from services.plan_generator import generate_plan_with_ai
from services.auth_service import get_user_from_token

router = APIRouter(prefix="/api/plans", tags=["plans"])


@router.get("/stats", response_model=PlanStatsResponse)
async def get_plan_stats(
    supabase: Client = Depends(get_supabase_client),
    user_id: str = Depends(get_user_from_token),
):
    """
    Get plan statistics (counts by status) for the current user
    This is a lightweight endpoint that returns only counts without fetching full plan data
    """
    try:
        # Get all plans for the user (just id and status fields for efficiency)
        result = (
            supabase.table("plans")
            .select("id, status")
            .eq("user_id", user_id)
            .execute()
        )

        plans = result.data

        # Count by status
        active_count = sum(1 for p in plans if p["status"] == "active")
        completed_count = sum(1 for p in plans if p["status"] == "completed")
        archived_count = sum(1 for p in plans if p["status"] == "archived")
        total_count = len(plans)

        return PlanStatsResponse(
            active=active_count,
            completed=completed_count,
            archived=archived_count,
            total=total_count,
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching plan stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch plan stats: {str(e)}",
        )


@router.get("/", response_model=List[PlanResponse])
async def get_all_plans(
    status: str = None,
    page: int = 1,
    limit: int = 20,
    supabase: Client = Depends(get_supabase_client),
    user_id: str = Depends(get_user_from_token),
):
    """
    Get all plans for the current user
    Optional filter by status
    Pagination support with page and limit
    """
    try:
        # Calculate range
        start = (page - 1) * limit
        end = start + limit - 1

        # Build query with nested select for tasks and resources
        # This avoids N+1 problem by fetching everything in one go
        query = (
            supabase.table("plans")
            .select("*, tasks(*), resources(*)")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .range(start, end)
        )

        # Filter by status if provided
        if status:
            query = query.eq("status", status)

        # Execute query
        result = query.execute()

        # Transform data to match response model
        plans_with_details = []
        for plan in result.data:
            # Tasks and resources are now nested in the plan object
            # We need to handle potential None values if the join returns nothing (though unlikely for lists)
            tasks = plan.get("tasks", [])
            # Sort tasks by order
            tasks.sort(key=lambda x: x.get("order", 0))
            
            resources = plan.get("resources", [])

            plan_response = PlanResponse(
                id=plan["id"],
                user_id=plan["user_id"],
                title=plan["title"],
                description=plan["description"],
                status=plan["status"],
                tasks=[TaskResponse(**task) for task in tasks],
                resources=[
                    ResourceResponse(**resource) for resource in resources
                ],
                created_at=plan["created_at"],
                updated_at=plan["updated_at"],
                # AI Intelligence Metadata (if present)
                plan_type=plan.get("plan_type"),
                total_estimated_hours=plan.get("total_estimated_hours"),
                total_estimated_cost_usd=plan.get("total_estimated_cost_usd"),
                health_score=plan.get("health_score"),
                last_analyzed_at=plan.get("last_analyzed_at"),
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

        # Insert tasks with AI intelligence metadata
        tasks_data = []
        for task in ai_response["tasks"]:
            tasks_data.append(
                {
                    "plan_id": plan_id,
                    "title": task["title"],
                    "description": task.get("description", ""),
                    "status": "pending",
                    "order": task.get("order", 0),
                    # AI Intelligence Metadata
                    "estimated_time_hours": task.get("estimated_time_hours"),
                    "difficulty": task.get("difficulty"),
                    "estimated_cost_usd": task.get("estimated_cost_usd"),
                    "tools_needed": task.get("tools_needed", []),
                    "prerequisites": task.get("prerequisites", []),
                    "tags": task.get("tags", []),
                }
            )

        # Extract resources from AI response
        resources_data = []
        for resource in ai_response.get("resources", []):
            resources_data.append(
                {
                    "plan_id": plan_id,
                    "title": resource["title"],
                    "url": resource["url"],
                    "type": resource.get("type", "link"),
                }
            )

        # Compute AI intelligence aggregates for the plan
        total_estimated_hours = sum(task.get('estimated_time_hours') or 0 for task in tasks_data)
        total_estimated_cost_usd = sum(task.get('estimated_cost_usd') or 0 for task in tasks_data)
        # Simple health score calculation: average difficulty (scale 1-5) -> map to 0-100
        difficulties = [task.get('difficulty') for task in tasks_data if task.get('difficulty')]
        if difficulties:
            avg_difficulty = sum(difficulties) / len(difficulties)
            health_score = int((6 - avg_difficulty) * 20)  # 5 -> 20, 1 -> 100
        else:
            health_score = None
        # Update plan with computed metadata
        supabase.table("plans").update({
            "total_estimated_hours": total_estimated_hours,
            "total_estimated_cost_usd": total_estimated_cost_usd,
            "health_score": health_score,
            "plan_type": ai_response.get("plan_type", "default"),
        }).eq("id", plan_id).execute()

        # Insert tasks and resources
        tasks_result = supabase.table("tasks").insert(tasks_data).execute()
        resources_result = supabase.table("resources").insert(resources_data).execute()

        # Build response with AI intelligence metadata
        response = PlanGenerateResponse(
            plan=PlanResponse(
                id=plan["id"],
                user_id=plan["user_id"],
                title=plan["title"],
                description=plan["description"],
                status=plan["status"],
                tasks=[TaskResponse(**t) for t in tasks_result.data],
                resources=[ResourceResponse(**r) for r in resources_result.data],
                created_at=plan["created_at"],
                updated_at=plan["updated_at"],
                plan_type=ai_response.get("plan_type", "default"),
                total_estimated_hours=total_estimated_hours,
                total_estimated_cost_usd=total_estimated_cost_usd,
                health_score=health_score,
                last_analyzed_at=None,
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

        # Build response with AI metadata
        plan_response = PlanResponse(
            id=plan["id"],
            user_id=plan["user_id"],
            title=plan["title"],
            description=plan["description"],
            status=plan["status"],
            tasks=[TaskResponse(**t) for t in tasks_result.data],
            resources=[ResourceResponse(**r) for r in resources_result.data],
            created_at=plan["created_at"],
            updated_at=plan["updated_at"],
            plan_type=plan.get("plan_type"),
            total_estimated_hours=plan.get("total_estimated_hours"),
            total_estimated_cost_usd=plan.get("total_estimated_cost_usd"),
            health_score=plan.get("health_score"),
            last_analyzed_at=plan.get("last_analyzed_at"),
        )
        return plan_response

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching plan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch plan: {str(e)}",
        )


@router.delete("/{plan_id}", status_code=status.HTTP_200_OK)
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

        return {"message": "Plan deleted successfully", "id": plan_id}

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
