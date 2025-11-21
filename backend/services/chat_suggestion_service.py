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
            "suggested_tasks": [  # ONLY for 'add_task' type
                {"title": "Buy flour", "description": "All purpose flour"}
            ]
        }
    ]
}
IMPORTANT: Titles must be 100% relevant to the content. Do NOT use generic titles like "Ticket Booking" unless it's actually about tickets.
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
    
    # 3. Mark as accepted
    supabase.table("chat_suggestions")\
        .update({"status": "accepted", "acted_at": "now()"})\
        .eq("id", suggestion_id)\
        .execute()

def _handle_add_task_action(suggestion: Dict[str, Any], supabase: Client):
    """
    Handle 'add_task' action: Add suggested tasks to the plan.
    """
    # The AI should have provided suggested_tasks in the metadata
    # But since we didn't store it in a dedicated column, we might need to parse it from description or 
    # rely on the fact that we added 'suggested_tasks' to the JSON structure in the prompt.
    # However, our DB schema for chat_suggestions doesn't have a 'suggested_tasks' column.
    # It likely got stored in a JSONB column if we had one, but we defined specific columns.
    # Wait, looking at schema: we don't have a generic data column!
    # We only have: title, description, related_task_ids, reasoning.
    
    # WORKAROUND: Since we didn't add a JSONB 'data' column, we'll have to 
    # generate the task on the fly based on the suggestion title/description.
    # Or, we can just add a single task based on the description.
    
    # Let's create a simple task based on the suggestion title for now.
    
    new_task = {
        "plan_id": suggestion["plan_id"],
        "title": f"New Task: {suggestion['title']}",
        "description": suggestion["description"],
        "status": "pending",
        "order": 999 # Put at end
    }
    supabase.table("tasks").insert(new_task).execute()


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

