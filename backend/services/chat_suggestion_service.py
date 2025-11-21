from openai import OpenAI
from config import get_settings
import json
import re
from typing import List, Dict, Any
from supabase import Client
from api.schemas.chat_suggestion_schemas import ChatSuggestionCreate, SuggestionType, SuggestionPriority
from services.subtask_generator import generate_subtasks_with_ai



settings = get_settings()
client = OpenAI(api_key=settings.openai_api_key)

# Security limits
MAX_SUGGESTED_TASKS = 10
MAX_SUBTASKS = 20
MAX_SUGGESTIONS_PER_GENERATION = 5
MAX_TITLE_LENGTH = 200
MAX_DESCRIPTION_LENGTH = 1000

# UUID validation pattern
UUID_PATTERN = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)

def _is_valid_uuid(uuid_string: str) -> bool:
    """Validate UUID format."""
    if not uuid_string or not isinstance(uuid_string, str):
        return False
    return bool(UUID_PATTERN.match(uuid_string))

def _sanitize_text(text: str, max_length: int) -> str:
    """Sanitize text to prevent XSS and limit length."""
    if not isinstance(text, str):
        return ""
    # Remove potential HTML/script tags
    text = re.sub(r'<[^>]+>', '', text)
    # Limit length
    return text[:max_length].strip()

def _validate_task_ids_belong_to_plan(task_ids: List[str], plan_id: str, supabase: Client) -> List[str]:
    """Validate that task IDs belong to the specified plan."""
    if not task_ids:
        return []
    
    valid_ids = []
    for task_id in task_ids:
        if not _is_valid_uuid(task_id):
            continue
        
        # Verify task belongs to plan
        try:
            result = supabase.table("tasks").select("id").eq("id", task_id).eq("plan_id", plan_id).execute()
            if result.data:
                valid_ids.append(task_id)
        except Exception as e:
            continue
    
    return valid_ids

def _validate_suggestion_data(suggestion_data: Dict[str, Any], plan_id: str, supabase: Client) -> Dict[str, Any]:
    """Validate and sanitize AI-generated suggestion data."""
    validated = {}
    
    # Validate and sanitize title
    validated["title"] = _sanitize_text(suggestion_data.get("title", "Suggestion"), MAX_TITLE_LENGTH)
    if not validated["title"]:
        validated["title"] = "Suggestion"
    
    # Validate and sanitize description
    validated["description"] = _sanitize_text(suggestion_data.get("description", ""), MAX_DESCRIPTION_LENGTH)
    
    # Validate suggestion_type
    suggestion_type = suggestion_data.get("suggestion_type", "")
    valid_types = ["breakdown", "add_task", "optimize", "warning"]
    validated["suggestion_type"] = suggestion_type if suggestion_type in valid_types else "warning"
    
    # Validate priority
    priority = suggestion_data.get("priority", "medium")
    valid_priorities = ["low", "medium", "high"]
    validated["priority"] = priority if priority in valid_priorities else "medium"
    
    # Validate action_button_text
    validated["action_button_text"] = _sanitize_text(suggestion_data.get("action_button_text", "Do it"), 50)
    
    # Validate related_task_ids
    task_ids = suggestion_data.get("related_task_ids", [])
    if isinstance(task_ids, list):
        validated["related_task_ids"] = _validate_task_ids_belong_to_plan(task_ids, plan_id, supabase)
    else:
        validated["related_task_ids"] = []
    
    # Validate confidence_score
    confidence = suggestion_data.get("confidence_score", 0.5)
    try:
        confidence = float(confidence)
        validated["confidence_score"] = max(0.0, min(1.0, confidence))
    except (ValueError, TypeError):
        validated["confidence_score"] = 0.5
    
    # Validate reasoning
    validated["reasoning"] = _sanitize_text(suggestion_data.get("reasoning", ""), MAX_DESCRIPTION_LENGTH)
    
    # Validate metadata
    metadata = suggestion_data.get("metadata", {})
    if not isinstance(metadata, dict):
        metadata = {}
    
    # Validate suggested_tasks in metadata
    if "suggested_tasks" in metadata:
        suggested_tasks = metadata["suggested_tasks"]
        if isinstance(suggested_tasks, list):
            # Limit number of suggested tasks
            suggested_tasks = suggested_tasks[:MAX_SUGGESTED_TASKS]
            # Sanitize each task
            validated_tasks = []
            for task in suggested_tasks:
                if isinstance(task, dict):
                    validated_tasks.append({
                        "title": _sanitize_text(task.get("title", "New Task"), MAX_TITLE_LENGTH),
                        "description": _sanitize_text(task.get("description", ""), MAX_DESCRIPTION_LENGTH)
                    })
            metadata["suggested_tasks"] = validated_tasks
    
    # Validate operations in metadata
    if "operations" in metadata:
        operations = metadata["operations"]
        if isinstance(operations, list):
            validated_ops = []
            for op in operations:
                if isinstance(op, dict) and op.get("type") == "reorder":
                    task_id = op.get("task_id")
                    before_task_id = op.get("before_task_id")
                    if _is_valid_uuid(task_id) and _is_valid_uuid(before_task_id):
                        validated_ops.append({
                            "type": "reorder",
                            "task_id": task_id,
                            "before_task_id": before_task_id
                        })
            metadata["operations"] = validated_ops
    
    validated["metadata"] = metadata
    validated["actionable"] = bool(suggestion_data.get("actionable", True))
    
    return validated

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
        
        # Limit number of suggestions
        suggestions_data = suggestions_data[:MAX_SUGGESTIONS_PER_GENERATION]
        
        new_suggestions = []
        
        # 3. Validate and save to DB
        for s in suggestions_data:
            try:
                # Validate and sanitize AI-generated data
                validated_data = _validate_suggestion_data(s, plan["id"], supabase)
                
                # Check if similar suggestion already exists to avoid spam
                existing = supabase.table("chat_suggestions")\
                    .select("id")\
                    .eq("plan_id", plan["id"])\
                    .eq("title", validated_data["title"])\
                    .eq("status", "pending")\
                    .execute()
                if existing.data:

                    continue

                suggestion = ChatSuggestionCreate(
                    plan_id=plan["id"],
                    user_id=user_id,
                    **validated_data
                )
                
                # Convert to dict for Supabase
                suggestion_dict = suggestion.model_dump()
                suggestion_dict["suggestion_type"] = suggestion.suggestion_type.value
                suggestion_dict["priority"] = suggestion.priority.value
                
                result = supabase.table("chat_suggestions").insert(suggestion_dict).execute()
                if result.data:
                    new_suggestions.append(result.data[0])

            except Exception as e:

                continue
                
        return new_suggestions

    except json.JSONDecodeError as e:

        return []
    except Exception as e:

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
    
    if not isinstance(suggested_tasks, list):

        return
    
    # Enforce limit
    suggested_tasks = suggested_tasks[:MAX_SUGGESTED_TASKS]
    
    if not suggested_tasks:
        # Fallback if no structured data
        new_task = {
            "plan_id": suggestion["plan_id"],
            "title": _sanitize_text(f"New Task: {suggestion['title']}", MAX_TITLE_LENGTH),
            "description": _sanitize_text(suggestion["description"], MAX_DESCRIPTION_LENGTH),
            "status": "pending",
            "order": 999
        }
        try:
            supabase.table("tasks").insert(new_task).execute()
        except Exception as e:
            pass
        return

    for st in suggested_tasks:
        if not isinstance(st, dict):
            continue
            
        new_task = {
            "plan_id": suggestion["plan_id"],
            "title": _sanitize_text(st.get("title", "New Task"), MAX_TITLE_LENGTH),
            "description": _sanitize_text(st.get("description", ""), MAX_DESCRIPTION_LENGTH),
            "status": "pending",
            "order": 999
        }
        try:
            supabase.table("tasks").insert(new_task).execute()

        except Exception as e:

            continue

def _handle_optimize_action(suggestion: Dict[str, Any], supabase: Client):
    """
    Handle 'optimize' action: Reorder tasks.
    """
    metadata = suggestion.get("metadata", {})
    operations = metadata.get("operations", [])
    
    if not isinstance(operations, list):

        return
    
    for op in operations:
        if not isinstance(op, dict) or op.get("type") != "reorder":
            continue
            
        task_id = op.get("task_id")
        before_task_id = op.get("before_task_id")
        
        # Validate UUIDs
        if not _is_valid_uuid(task_id) or not _is_valid_uuid(before_task_id):

            continue
        
        try:
            # Verify both tasks belong to the plan
            plan_id = suggestion["plan_id"]
            task_check = supabase.table("tasks").select("id").eq("id", task_id).eq("plan_id", plan_id).execute()
            before_check = supabase.table("tasks").select("id").eq("id", before_task_id).eq("plan_id", plan_id).execute()
            
            if not task_check.data or not before_check.data:

                continue
            
            # Get all tasks for plan
            all_tasks = supabase.table("tasks").select("id, order").eq("plan_id", plan_id).order("order").execute()
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
            

        except Exception as e:

            continue


def _handle_breakdown_action(suggestion: Dict[str, Any], supabase: Client):
    """
    Handle 'breakdown' action: Generate subtasks for related tasks.
    """
    task_ids = suggestion.get("related_task_ids", [])
    
    if not isinstance(task_ids, list):

        return
    
    for task_id in task_ids:
        # Validate UUID
        if not _is_valid_uuid(task_id):

            continue
        
        try:
            # Verify task belongs to the plan
            plan_id = suggestion["plan_id"]
            task_res = supabase.table("tasks").select("*").eq("id", task_id).eq("plan_id", plan_id).execute()
            if not task_res.data:

                continue
                
            task = task_res.data[0]
            
            # Generate subtasks
            subtasks = generate_subtasks_with_ai(task["title"], task.get("description", ""))
            
            # Enforce limit
            subtasks = subtasks[:MAX_SUBTASKS]
            
            # Save subtasks
            for i, st in enumerate(subtasks):
                if not isinstance(st, dict):
                    continue
                    
                subtask_data = {
                    "task_id": task_id,
                    "title": _sanitize_text(st.get("title", "Subtask"), MAX_TITLE_LENGTH),
                    "description": _sanitize_text(st.get("description", ""), MAX_DESCRIPTION_LENGTH),
                    "is_completed": False,
                    "order": i + 1
                }
                try:
                    supabase.table("subtasks").insert(subtask_data).execute()

                except Exception as e:

                    continue
        except Exception as e:

            continue

