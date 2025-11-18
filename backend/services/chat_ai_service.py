from openai import OpenAI
from config import get_settings
import json
from typing import Dict, List, Any, Optional

settings = get_settings()
client = OpenAI(api_key=settings.openai_api_key)

def get_chat_response(
    user_message: str,
    plan: Dict[str, Any],
    tasks: List[Dict[str, Any]],
    chat_history: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Get intelligent AI response with actionable suggestions
    """
    
    # Calculate plan statistics
    total_tasks = len(tasks)
    completed_tasks = len([t for t in tasks if t['status'] == 'completed'])
    pending_tasks = len([t for t in tasks if t['status'] == 'pending'])
    progress_percent = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    # Build detailed task context
    tasks_text = "\n".join([
        f"{i+1}. [{task['status'].upper()}] {task['title']}\n   Description: {task.get('description', 'No description')[:150]}..."
        for i, task in enumerate(tasks)
    ])
    
    # Build chat history
    history_text = "\n".join([
        f"{msg['role'].title()}: {msg['content']}"
        for msg in chat_history[-6:]  # Last 6 messages for context
    ])
    
    system_prompt = f"""You are PlanGenie's AI Assistant - an expert planning copilot that helps users execute their plans successfully.

CURRENT PLAN OVERVIEW:
Title: {plan['title']}
Description: {plan['description']}
Status: {plan['status']}
Progress: {completed_tasks}/{total_tasks} tasks complete ({progress_percent:.0f}%)
Pending: {pending_tasks} tasks

CURRENT TASKS:
{tasks_text}

RECENT CONVERSATION:
{history_text}

YOUR CAPABILITIES:
You can help users in these ways:

1. TASK GUIDANCE - Provide step-by-step instructions for any task
   Example: "How do I complete task 3?" → Give detailed breakdown with specific steps

2. RESOURCE RECOMMENDATIONS - Suggest specific tools, websites, services
   Example: "Where can I book hotels?" → Recommend Booking.com, Airbnb, specific hotel sites with pros/cons

3. PLAN REFINEMENT - Suggest improvements, additions, or modifications
   Example: "This feels incomplete" → Identify gaps and suggest 2-3 new tasks with details

4. PROBLEM SOLVING - Help overcome obstacles or blockers
   Example: "I'm stuck on task 5" → Provide alternative approaches, workarounds, or simpler methods

5. PROGRESS ANALYSIS - Give insights on what's going well and what needs attention
   Example: "How am I doing?" → Analyze progress, identify risks, suggest priorities

6. NEXT STEPS - Recommend what to focus on next
   Example: "What should I do now?" → Suggest the most logical next task with reasoning

7. COST/TIME ESTIMATES - Provide realistic estimates and budgets
   Example: "How much will this cost?" → Break down costs by category with ranges

8. SPECIFIC RECOMMENDATIONS - Give exact brands, services, vendors
   Example: "What's the best tool for X?" → Compare 2-3 options with specific pros/cons

RESPONSE STYLE:
- Be conversational and friendly, like a knowledgeable friend
- Reference specific task numbers when relevant (e.g., "For Task 3...")
- Provide SPECIFIC recommendations (brands, URLs, exact steps)
- Give 2-3 options when there are alternatives
- Include pro tips or insider knowledge
- Break down complex answers into numbered steps or bullet points
- Ask clarifying questions if user intent is unclear
- Keep responses focused and actionable
- No emojis - keep it professional and clean

ACTIONABLE SUGGESTIONS:
When relevant, suggest concrete actions the user can take:
- "Want me to break Task X into smaller subtasks?"
- "I can suggest 3 more tasks to make this plan more complete"
- "Would you like specific hotel recommendations for your budget?"
- "I can help you create a day-by-day itinerary"

Remember: Your goal is to make execution EASY. The user should feel supported and clear on next steps after every response."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",  # Using GPT-4 for better reasoning
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,
            max_tokens=800  # Increased for detailed responses
        )
        
        ai_content = response.choices[0].message.content.strip()
        
        # Analyze if AI is suggesting actions
        suggested_actions = extract_suggested_actions(ai_content, user_message)
        
        return {
            "content": ai_content,
            "suggested_actions": suggested_actions
        }
        
    except Exception as e:
        print(f"AI chat error: {e}")
        return {
            "content": "I'm having trouble connecting right now. Please try again in a moment.",
            "suggested_actions": None
        }


def extract_suggested_actions(ai_response: str, user_message: str) -> Optional[List[Dict[str, str]]]:
    """
    Extract actionable suggestions from AI response
    Returns list of suggested actions user can take
    """
    suggestions = []
    
    # Check for common action patterns in AI response
    action_keywords = [
        "want me to",
        "would you like",
        "i can help",
        "shall i",
        "let me know if",
        "do you want",
    ]
    
    response_lower = ai_response.lower()
    
    # If AI is offering to do something, extract it
    for keyword in action_keywords:
        if keyword in response_lower:
            # Found a suggestion - could parse it more intelligently
            # For now, flag that there are suggestions
            suggestions.append({
                "type": "ai_suggestion",
                "description": "AI has suggestions for you",
                "action": "review_response"
            })
            break
    
    return suggestions if suggestions else None
