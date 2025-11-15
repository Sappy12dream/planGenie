from openai import OpenAI
from config import get_settings
import json
from typing import Dict, List

settings = get_settings()
client = OpenAI(api_key=settings.openai_api_key)

def generate_plan_with_ai(title: str, description: str, timeline: str = None) -> Dict:
    """
    Generate a structured plan using OpenAI GPT-4
    
    Args:
        title: Plan title
        description: Plan description
        timeline: Optional timeline (e.g., "2 weeks", "1 month")
    
    Returns:
        Dictionary with tasks and resources
    """
    
    # Build the prompt
    timeline_text = f" within {timeline}" if timeline else ""
    
    prompt = f"""You are an expert planning assistant. Generate a detailed, actionable plan for the following goal:

Title: {title}
Description: {description}
Timeline: {timeline_text if timeline else "No specific timeline provided"}

Create a structured plan with:
1. A list of specific, actionable tasks (5-10 tasks)
2. Each task should have a clear title and brief description
3. Order tasks logically (what should be done first, second, etc.)
4. Suggest helpful resources (articles, tools, websites) that would help complete this plan

Respond in valid JSON format with this exact structure:
{{
    "tasks": [
        {{
            "title": "Task title",
            "description": "Detailed description of what to do",
            "order": 1
        }}
    ],
    "resources": [
        {{
            "title": "Resource name",
            "url": "https://example.com",
            "type": "link"
        }}
    ]
}}

Important: 
- Make tasks specific and actionable
- Order should be sequential (1, 2, 3, etc.)
- Resources should be real, helpful links (documentation, tutorials, tools)
- Resource type must be one of: "link", "document", "video", "other"
"""

    try:
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # or "gpt-4" for better quality
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful planning assistant that creates detailed, actionable plans. Always respond with valid JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        # Extract the response content
        content = response.choices[0].message.content.strip()
        
        # Parse JSON response
        # Remove markdown code blocks if present
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        plan_data = json.loads(content)
        
        # Validate structure
        if "tasks" not in plan_data or "resources" not in plan_data:
            raise ValueError("Invalid plan structure from AI")
        
        return plan_data
        
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        print(f"Response content: {content}")
        # Return a fallback plan
        return {
            "tasks": [
                {
                    "title": "Research and gather information",
                    "description": f"Research about {title} to understand requirements and best practices",
                    "order": 1
                },
                {
                    "title": "Create an action plan",
                    "description": "Break down the goal into smaller, manageable steps",
                    "order": 2
                },
                {
                    "title": "Start implementation",
                    "description": "Begin working on the first actionable step",
                    "order": 3
                }
            ],
            "resources": [
                {
                    "title": "General planning guide",
                    "url": "https://www.mindtools.com/arb6g1q/smart-goals",
                    "type": "link"
                }
            ]
        }
    
    except Exception as e:
        print(f"AI generation error: {e}")
        raise
