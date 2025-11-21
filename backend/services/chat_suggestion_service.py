from openai import OpenAI
from config import get_settings
import json
from typing import List, Dict, Any
from supabase import Client
from api.schemas.chat_suggestion_schemas import ChatSuggestionCreate, SuggestionType, SuggestionPriority

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
            "title": "Short catchy title",
            "description": "Clear explanation of why this is needed",
            "suggestion_type": "breakdown" | "add_task" | "optimize" | "warning",
            "priority": "low" | "medium" | "high",
            "action_button_text": "Button label (e.g., 'Break it down', 'Add tasks')",
            "related_task_ids": ["task_uuid_1"],
            "confidence_score": 0.9,
            "reasoning": "Why you think this is important"
        }
    ]
}
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
    """Mark a suggestion as accepted."""
    supabase.table("chat_suggestions")\
        .update({"status": "accepted", "acted_at": "now()"})\
        .eq("id", suggestion_id)\
        .execute()
