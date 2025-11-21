from openai import OpenAI
from config import get_settings
import json
from typing import List, Dict, Any
from supabase import Client
from api.schemas.chat_suggestion_schemas import ChatSuggestionCreate, SuggestionType, SuggestionPriority
from services.subtask_generator import generate_subtasks_with_ai


settings = get_settings()
client = OpenAI(api_key=settings.openai_api_key)

SYSTEM_PROMPT_SUGGESTIONS = """
You are an expert Project Manager AI. Your goal is to proactively analyze a project plan and suggest "Nudges" to help the user succeed.

Analyze the provided PLAN and TASKS. Look for:
1. **Breakdown Opportunities**: Are there tasks that are too vague or estimated to take > 4 hours? Suggest breaking them down.
2. **Missing Steps (Gaps)**: Are there logical gaps? (e.g., "Travel to X" but no "Book tickets").
3. **Risk Warnings**: Are there deadlines approaching without prerequisites met?
4. **Optimizations**: Can tasks be grouped or reordered?

Return a JSON object with a list of suggestions.
Format:
{
    "suggestions": [
        {
            "title": "Short, RELEVANT title (e.g., 'Add Shopping Task', 'Break down Baking')",
            "description": "Clear explanation of why this is needed",
            "suggestion_type": "breakdown" | "add_task" | "optimize" | "warning",
            "priority": "low" | "medium" | "high",
            "action_button_text": "Button label (e.g., 'Break it down', 'Add tasks')",
            "related_task_ids": ["task_uuid_1"],
            "confidence_score": 0.9,
            "reasoning": "Why you think this is important",
            "metadata": {
                "suggested_tasks": [  # REQUIRED for 'add_task' type
                    {"title": "Buy flour", "description": "All purpose flour"}
                ],
                "operations": [ # REQUIRED for 'optimize' type (reorder)
                    {"type": "reorder", "task_id": "uuid", "before_task_id": "uuid"} 
                ]
            }
        }
    ]
}
IMPORTANT: Titles must be 100% relevant to the content. Do NOT use generic titles like "Ticket Booking" unless it's actually about tickets.
For 'optimize' suggestions that involve reordering, provide the 'operations' in metadata.
"""


def generate_proactive_suggestions(plan: Dict[str, Any], tasks: List[Dict[str, Any]], user_id: str, supabase: Client) -> List[Dict[str, Any]]:
    """
    Analyzes the plan and generates proactive suggestions.
    Saves them to the database and returns the new suggestions.
    """
    
    # 1. Prepare context for LLM
    tasks_context = json.dumps([{
        "id": t["id"],
        "title": t["title"],
        "description": t.get("description"),
        "status": t["status"],
        "estimated_hours": t.get("estimated_time_hours")
    } for t in tasks], indent=2)

    prompt = f"""
    PLAN: {plan['title']}
    DESCRIPTION: {plan['description']}
    
    TASKS:
    {tasks_context}
    
    Generate 1-3 high-quality suggestions. Do not suggest things that are already done.
    """

    try:
        # 2. Call LLM
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT_SUGGESTIONS},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7
        )
        
        content = response.choices[0].message.content
        data = json.loads(content)
        suggestions_data = data.get("suggestions", [])
        
        new_suggestions = []
        
        # 3. Save to DB
        for s in suggestions_data:
            # Check if similar suggestion already exists/dismissed to avoid spam
            # (Skipping complex dedup logic for MVP, just checking title match for active ones)
            existing = supabase.table("chat_suggestions").select("id").eq("plan_id", plan["id"]).eq("title", s["title"]).execute()
            if existing.data:
                continue

            suggestion = ChatSuggestionCreate(
                plan_id=plan["id"],
                user_id=user_id,
                **s
            )
            
            # Convert to dict for Supabase
            suggestion_dict = suggestion.model_dump()
            # Handle enum conversion if needed (pydantic model_dump usually handles it but supabase might need strings)
            suggestion_dict["suggestion_type"] = suggestion.suggestion_type.value
            suggestion_dict["priority"] = suggestion.priority.value
            # Ensure metadata is a dict (it should be from pydantic, but just in case)
            if not isinstance(suggestion_dict.get("metadata"), dict):
                 suggestion_dict["metadata"] = {}
            
            result = supabase.table("chat_suggestions").insert(suggestion_dict).execute()
            if result.data:
                new_suggestions.append(result.data[0])
                
        return new_suggestions

    except Exception as e:
        print(f"Error generating suggestions: {e}")
        return []

def get_pending_suggestions(plan_id: str, supabase: Client) -> List[Dict[str, Any]]:
    """Fetch all pending suggestions for a plan."""
    result = supabase.table("chat_suggestions")\
        .select("*")\
        .eq("plan_id", plan_id)\
        .eq("status", "pending")\
        .order("created_at", desc=True)\
        .execute()
    return result.data

def dismiss_suggestion(suggestion_id: str, supabase: Client):
    """Mark a suggestion as dismissed."""
    supabase.table("chat_suggestions")\
        .update({"status": "dismissed", "acted_at": "now()"})\
        .eq("id", suggestion_id)\
        .execute()

def accept_suggestion(suggestion_id: str, supabase: Client):
    """
    Execute the action associated with the suggestion and mark as accepted.
    """
    # 1. Get suggestion details
    result = supabase.table("chat_suggestions").select("*").eq("id", suggestion_id).execute()
    if not result.data:
        raise Exception("Suggestion not found")
    
    suggestion = result.data[0]
    
    # 2. Perform Action based on type
    if suggestion["suggestion_type"] == "breakdown":
        _handle_breakdown_action(suggestion, supabase)
    elif suggestion["suggestion_type"] == "add_task":
        _handle_add_task_action(suggestion, supabase)
    elif suggestion["suggestion_type"] == "optimize":
        _handle_optimize_action(suggestion, supabase)
    
    # 3. Mark as accepted
    supabase.table("chat_suggestions")\
        .update({"status": "accepted", "acted_at": "now()"})\
        .eq("id", suggestion_id)\
        .execute()

def _handle_add_task_action(suggestion: Dict[str, Any], supabase: Client):
    """
    Handle 'add_task' action: Add suggested tasks to the plan.
    """
    metadata = suggestion.get("metadata", {})
    suggested_tasks = metadata.get("suggested_tasks", [])
    
    if not suggested_tasks:
        # Fallback if no structured data
        new_task = {
            "plan_id": suggestion["plan_id"],
            "title": f"New Task: {suggestion['title']}",
            "description": suggestion["description"],
            "status": "pending",
            "order": 999 # Put at end
        }
        supabase.table("tasks").insert(new_task).execute()
        return

    for st in suggested_tasks:
        new_task = {
            "plan_id": suggestion["plan_id"],
            "title": st.get("title", "New Task"),
            "description": st.get("description", ""),
            "status": "pending",
            "order": 999
        }
        supabase.table("tasks").insert(new_task).execute()

def _handle_optimize_action(suggestion: Dict[str, Any], supabase: Client):
    """
    Handle 'optimize' action: Reorder tasks.
    """
    metadata = suggestion.get("metadata", {})
    operations = metadata.get("operations", [])
    
    for op in operations:
        if op.get("type") == "reorder":
            task_id = op.get("task_id")
            before_task_id = op.get("before_task_id")
            
            if not task_id or not before_task_id:
                continue
            
            # Get all tasks for plan
            all_tasks = supabase.table("tasks").select("id, order").eq("plan_id", suggestion["plan_id"]).order("order").execute()
            tasks_list = all_tasks.data
            
            # Find current index of task to move
            task_to_move = next((t for t in tasks_list if t["id"] == task_id), None)
            if not task_to_move:
                continue
                
            # Remove from list
            tasks_list = [t for t in tasks_list if t["id"] != task_id]
            
            # Find index to insert
            insert_idx = -1
            for i, t in enumerate(tasks_list):
                if t["id"] == before_task_id:
                    insert_idx = i
                    break
            
            if insert_idx != -1:
                tasks_list.insert(insert_idx, task_to_move)
            else:
                tasks_list.append(task_to_move)
                
            # Re-assign orders
            for i, t in enumerate(tasks_list):
                supabase.table("tasks").update({"order": i + 1}).eq("id", t["id"]).execute()


def _handle_breakdown_action(suggestion: Dict[str, Any], supabase: Client):
    """
    Handle 'breakdown' action: Generate subtasks for related tasks.
    """
    task_ids = suggestion.get("related_task_ids", [])
    
    for task_id in task_ids:
        # Get task details
        task_res = supabase.table("tasks").select("*").eq("id", task_id).execute()
        if not task_res.data:
            continue
            
        task = task_res.data[0]
        
        # Generate subtasks
        subtasks = generate_subtasks_with_ai(task["title"], task.get("description", ""))
        
        # Save subtasks
        for i, st in enumerate(subtasks):
            subtask_data = {
                "task_id": task_id,
                "title": st["title"],
                "description": st.get("description"),
                "is_completed": False,
                "order": i + 1
            }
            supabase.table("subtasks").insert(subtask_data).execute()

