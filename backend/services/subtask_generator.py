from openai import OpenAI
from config import get_settings
import json
from typing import List, Dict

settings = get_settings()
client = OpenAI(api_key=settings.openai_api_key)

def generate_subtasks_with_ai(task_title: str, task_description: str) -> List[Dict]:
    """
    Generate 4-8 specific subtasks for a given task using AI
    """
    
    prompt = f"""You are PlanGenie's task breakdown assistant. Break down this task into 4-8 actionable subtasks that someone can check off one by one.

Task: {task_title}
Description: {task_description}

Create subtasks that are:
1. SPECIFIC and ACTIONABLE (each can be completed in one sitting)
2. SEQUENTIAL (in logical order of execution)
3. CLEAR (no ambiguity about what needs to be done)
4. GRANULAR (small enough to track progress easily)

Each subtask should be a single, concrete action that takes 15-60 minutes.

Example - BAD subtasks:
❌ "Research options" (too vague)
❌ "Complete the booking" (too broad)

Example - GOOD subtasks:
✅ "Open Booking.com and search for hotels in Udaipur for Nov 15-18"
✅ "Compare top 5 hotels by price, ratings, and location"
✅ "Read recent reviews for top 3 choices"
✅ "Check availability and prices for 4 rooms"
✅ "Book rooms and screenshot confirmation"
✅ "Forward confirmation email to group"

Return JSON with this structure:
{{
    "subtasks": [
        {{
            "title": "Specific subtask title (action-oriented)",
            "description": "Optional 1-sentence clarification if needed"
        }}
    ]
}}

Generate 4-8 subtasks now:"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert at breaking down tasks into clear, actionable steps. Each subtask should be specific enough that someone knows exactly what to do."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=800
        )
        
        content = response.choices[0].message.content.strip()
        
        # Parse JSON
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        data = json.loads(content)
        return data.get("subtasks", [])
        
    except Exception as e:
        print(f"AI subtask generation error: {e}")
        # Return fallback subtasks
        return [
            {
                "title": f"Step 1: Start with {task_title.lower()}",
                "description": "Begin working on this task"
            },
            {
                "title": "Step 2: Gather required information and resources",
                "description": "Collect everything needed"
            },
            {
                "title": "Step 3: Execute the main action",
                "description": "Complete the core part of the task"
            },
            {
                "title": "Step 4: Verify and finalize",
                "description": "Review and confirm completion"
            }
        ]
