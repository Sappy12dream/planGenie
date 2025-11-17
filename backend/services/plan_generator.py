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

    prompt = f"""You are PlanGenie, an expert AI planning assistant that creates comprehensive, actionable plans. Your job is to do ALL the research and planning work for the user.

Title: {title}
Description: {description}
Timeline: {timeline_text if timeline else "No specific timeline provided"}

Your task is to:
1. Analyze the goal thoroughly
2. Research the best approach (don't tell the user to research - YOU do it based on your knowledge)
3. Create 7-12 specific, actionable tasks with clear steps
4. Provide 5-8 high-quality resources (real URLs to documentation, tutorials, tools)

IMPORTANT GUIDELINES:
- Tasks should be SPECIFIC and ACTIONABLE, not vague (❌ "Research X" ✅ "Set up development environment with Node.js and React")
- Each task should be something the user can actually DO, not just "learn" or "research"
- Break down complex goals into concrete steps
- Order tasks logically (prerequisites first)
- Include real, helpful resource URLs (official docs, popular tutorials, tools)
- Make the plan comprehensive enough that someone could follow it start-to-finish

Example of GOOD tasks:
✅ "Set up project repository on GitHub with README and initial folder structure"
✅ "Install and configure ESLint and Prettier for code quality"
✅ "Create authentication flow using Supabase Auth with email/password"
✅ "Design database schema for users, plans, and tasks tables"

Example of BAD tasks (avoid these):
❌ "Research best practices" (too vague)
❌ "Learn about X" (not actionable)
❌ "Gather information" (you should have already done this)

Respond in valid JSON format with this exact structure:
{{
    "tasks": [
        {{
            "title": "Task title (specific and actionable)",
            "description": "Detailed 2-3 sentence description of exactly what to do and why",
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

Resource type must be one of: "link", "document", "video", "other"

Now create a comprehensive, actionable plan that the user can follow immediately:"""

    try:
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # or "gpt-4" for better quality
            messages=[
                {
                    "role": "system",
                    "content": "You are PlanGenie, an expert planning assistant that creates detailed, actionable plans. You do the research and thinking for the user. Never create vague tasks like 'Research X' - instead create specific, actionable steps. Always respond with valid JSON.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=2500,
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

        # Validate we have enough tasks and resources
        if len(plan_data.get("tasks", [])) < 3:
            raise ValueError("AI generated too few tasks")

        return plan_data

    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        print(f"Response content: {content}")
        # Return a better fallback plan
        return create_fallback_plan(title, description, timeline)

    except Exception as e:
        print(f"AI generation error: {e}")
        raise


def create_fallback_plan(title: str, description: str, timeline: str = None) -> Dict:
    """Create a basic but useful fallback plan if AI fails"""
    return {
        "tasks": [
            {
                "title": "Define clear objectives and success criteria",
                "description": f"Write down specific, measurable goals for '{title}'. What does success look like? Create a checklist of deliverables.",
                "order": 1,
            },
            {
                "title": "Break down the goal into major milestones",
                "description": "Identify 3-5 major milestones that mark significant progress. These will become checkpoints for your plan.",
                "order": 2,
            },
            {
                "title": "List all required resources and tools",
                "description": "Document what you need: tools, software, accounts, materials, knowledge, or people. Gather everything upfront.",
                "order": 3,
            },
            {
                "title": "Create a detailed timeline with deadlines",
                "description": f"Map out when each milestone should be completed{f' within your {timeline} timeframe' if timeline else ''}. Add buffer time for unexpected issues.",
                "order": 4,
            },
            {
                "title": "Start with the first actionable step",
                "description": "Identify the very first concrete action you can take today. Complete it to build momentum.",
                "order": 5,
            },
            {
                "title": "Set up tracking and accountability",
                "description": "Create a system to track progress (spreadsheet, app, or checklist). Schedule regular review sessions.",
                "order": 6,
            },
            {
                "title": "Review and adjust the plan weekly",
                "description": "Set a recurring reminder to review progress, identify blockers, and adjust the plan as needed. Plans should be living documents.",
                "order": 7,
            },
        ],
        "resources": [
            {
                "title": "SMART Goals Framework",
                "url": "https://www.mindtools.com/arb6g1q/smart-goals",
                "type": "link",
            },
            {
                "title": "Project Management Guide",
                "url": "https://www.projectmanager.com/guides/project-management",
                "type": "link",
            },
            {
                "title": "Goal Setting Tips",
                "url": "https://asana.com/resources/goal-setting-tips",
                "type": "link",
            },
        ],
    }
