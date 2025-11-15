from openai import OpenAI
from config import get_settings
import json
from typing import Dict, List, Any

settings = get_settings()
client = OpenAI(api_key=settings.openai_api_key)

def get_chat_response(
    user_message: str,
    plan: Dict[str, Any],
    tasks: List[Dict[str, Any]],
    chat_history: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Get AI response for chat message with plan context
    """
    
    # Build context
    tasks_text = "\n".join([
        f"{i+1}. {task['title']} - {task['status']} - {task.get('description', '')}"
        for i, task in enumerate(tasks)
    ])
    
    # Build chat history
    history_text = "\n".join([
        f"{msg['role']}: {msg['content']}"
        for msg in chat_history[-5:]  # Last 5 messages
    ])
    
    system_prompt = f"""You are a helpful planning assistant for a plan management app called PlanGenie.

Current Plan:
Title: {plan['title']}
Description: {plan['description']}
Status: {plan['status']}

Current Tasks:
{tasks_text}

Recent Conversation:
{history_text}

You help users:
1. Get details about their tasks (quantities, steps, tips)
2. Find resources (websites, tools, guides)
3. Refine their plan (suggest improvements)
4. Answer questions about how to accomplish tasks

Be conversational, helpful, and specific. Reference task numbers when relevant.
If a task needs more detail, provide it. If user asks where to find something, suggest specific websites or resources.
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        ai_content = response.choices[0].message.content.strip()
        
        return {
            "content": ai_content,
            "suggested_actions": None  # Could add action suggestions later
        }
        
    except Exception as e:
        print(f"AI chat error: {e}")
        return {
            "content": "I'm having trouble responding right now. Please try again.",
            "suggested_actions": None
        }
