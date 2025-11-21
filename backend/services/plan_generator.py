from openai import OpenAI
from config import get_settings
import json
from typing import Dict

# Import utilities
from utils.plan_config import SYSTEM_PROMPT, TASK_CATEGORIES
from utils.json_helpers import clean_json_response, validate_plan_structure
from utils.prompt_builder import determine_plan_type, build_plan_prompt

settings = get_settings()
client = OpenAI(api_key=settings.openai_api_key)


def generate_plan_with_ai(title: str, description: str, timeline: str = None) -> Dict:
    """
    Generate a comprehensive, well-organized plan using OpenAI GPT-4.
    
    Args:
        title: Plan title
        description: Plan description
        timeline: Optional timeline (e.g., "2 weeks", "1 month")
    
    Returns:
        Dictionary with categorized tasks and relevant resources with AI intelligence metadata
        Format: {"tasks": [...], "resources": [...]}
    """
    
    # Determine plan type and build prompt
    plan_type = determine_plan_type(title, description, client)
    prompt = build_plan_prompt(title, description, timeline, plan_type)
    
    try:
        # Call OpenAI API with JSON mode for guaranteed valid JSON
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},  # Force JSON output
            temperature=0.7,
            max_tokens=4000,  # Increased for additional metadata
        )
        
        # Extract and parse response
        content = response.choices[0].message.content.strip()
        content = clean_json_response(content)
        plan_data = json.loads(content)
        
        # Validate structure
        validate_plan_structure(plan_data)
        
        return plan_data
    
    except json.JSONDecodeError as e:
        print(f"❌ JSON parsing error: {e}")
        print(f"📄 Raw response (first 500 chars): {content[:500]}")
        print(f"⚠️  Using fallback plan for: {title}")
        return create_fallback_plan(title, description, timeline)
    
    except Exception as e:
        print(f"❌ AI generation error: {e}")
        print(f"⚠️  Using fallback plan for: {title}")
        return create_fallback_plan(title, description, timeline)


def create_fallback_plan(title: str, description: str, timeline: str = None) -> Dict:
    """
    Create a high-quality fallback plan if AI generation fails.
    Uses a structured approach applicable to any plan type with intelligence metadata.
    """
    from utils.prompt_builder import determine_plan_type_fallback
    
    plan_type = determine_plan_type_fallback(title, description)
    categories = TASK_CATEGORIES[plan_type]
    
    timeline_context = f"within your {timeline} timeline" if timeline else "at your own pace"
    
    return {
        "tasks": [
            {
                "title": f"{categories[0]}: Define clear, specific goals",
                "description": f"Break down '{title}' into 3-5 specific, measurable objectives. Write down exactly what success looks like for each goal. Example: Instead of 'get better at X', write 'complete Y specific milestones by Z date'. Document these in a note-taking app like Notion or Google Docs for easy reference.",
                "order": 1,
                "estimated_time_hours": 1.5,
                "difficulty": 2,
                "estimated_cost_usd": 0,
                "tools_needed": ["Notion or Google Docs", "Notepad"],
                "prerequisites": [],
                "tags": ["planning", "goal_setting"]
            },
            {
                "title": f"{categories[0]}: Research and gather key resources",
                "description": f"Spend 2-3 hours researching the best resources for '{title}'. Look for: recommended tools/platforms, expert guides or tutorials, community forums for support, and estimated costs. Create a simple spreadsheet to compare options. Check reviews on Reddit, YouTube, or relevant communities to validate quality.",
                "order": 2,
                "estimated_time_hours": 2.5,
                "difficulty": 2,
                "estimated_cost_usd": 0,
                "tools_needed": ["Google Sheets", "Web browser"],
                "prerequisites": [],
                "tags": ["research", "online"]
            },
            {
                "title": f"{categories[1] if len(categories) > 1 else categories[0]}: Create detailed timeline and milestones",
                "description": f"Map out your plan {timeline_context} with specific weekly or bi-weekly milestones. For each milestone, list 2-3 concrete deliverables. Use a project management tool (Trello, Asana, or Google Calendar) to set reminders. Build in 15-20% buffer time for unexpected delays or learning curves.",
                "order": 3,
                "estimated_time_hours": 1.0,
                "difficulty": 3,
                "estimated_cost_usd": 0,
                "tools_needed": ["Trello or Asana", "Google Calendar"],
                "prerequisites": [1],
                "tags": ["planning", "time_management"]
            },
            {
                "title": f"{categories[1] if len(categories) > 1 else categories[0]}: Set up tools and environment",
                "description": f"Install and configure all necessary tools, software, or equipment needed for '{title}'. Create accounts on relevant platforms. Set up your workspace (physical or digital). Test that everything works properly. Bookmark important resources and organize them in browser folders or a bookmark manager.",
                "order": 4,
                "estimated_time_hours": 2.0,
                "difficulty": 2,
                "estimated_cost_usd": None,
                "tools_needed": ["Web browser", "Email"],
                "prerequisites": [2],
                "tags": ["setup", "preparation"]
            },
            {
                "title": f"{categories[2] if len(categories) > 2 else categories[0]}: Start with foundational tasks",
                "description": f"Begin with the most fundamental aspects of your plan. Focus on building a strong foundation before advancing to complex topics. Spend your first week on basics - this prevents confusion later. Follow the 80/20 rule: identify the 20% of skills/knowledge that will give you 80% of results.",
                "order": 5,
                "estimated_time_hours": 5.0,
                "difficulty": 3,
                "estimated_cost_usd": 0,
                "tools_needed": [],
                "prerequisites": [3, 4],
                "tags": ["execution", "learning"]
            },
            {
                "title": f"{categories[2] if len(categories) > 2 else categories[0]}: Implement daily/weekly routines",
                "description": f"Create consistent habits by scheduling specific times for working on '{title}'. Block out 30-90 minutes daily or 2-4 focused sessions weekly. Use habit tracking apps (H abitica, Streaks) to maintain momentum. Studies show it takes 21-66 days to form a habit, so commit to at least 30 days of consistency.",
                "order": 6,
                "estimated_time_hours": 0.5,
                "difficulty": 2,
                "estimated_cost_usd": 0,
                "tools_needed": ["Habitica or Streaks", "Calendar app"],
                "prerequisites": [],
                "tags": ["habits", "routine", "consistency"]
            },
            {
                "title": f"{categories[2] if len(categories) > 2 else categories[0]}: Track progress and adjust approach",
                "description": "Set up a simple tracking system to measure your progress weekly. Track: tasks completed, time spent, obstacles encountered, wins achieved. Every Sunday, review your progress and adjust next week's plan based on what worked and what didn't. Celebrate small wins to maintain motivation.",
                "order": 7,
                "estimated_time_hours": 1.0,
                "difficulty": 2,
                "estimated_cost_usd": 0,
                "tools_needed": ["Spreadsheet or tracking app"],
                "prerequisites": [5],
                "tags": ["tracking", "review", "weekly"]
            },
            {
                "title": f"{categories[3] if len(categories) > 3 else categories[-1]}: Build accountability and support",
                "description": "Find an accountability partner, join an online community, or share your goals publicly. Schedule weekly check-ins (30 min) to report progress. Join relevant Discord servers, subreddits, or Facebook groups related to your plan. Engaging with others doing similar things boosts motivation and provides valuable insights.",
                "order": 8,
                "estimated_time_hours": 1.5,
                "difficulty": 2,
                "estimated_cost_usd": 0,
                "tools_needed": ["Discord or Reddit", "Calendar for check-ins"],
                "prerequisites": [],
                "tags": ["community", "accountability", "support"]
            },
        ],
        "resources": [
            {
                "title": "Notion - Free Planning Templates",
                "url": "https://www.notion.so/templates",
                "type": "link",
            },
            {
                "title": "Trello - Visual Task Management",
                "url": "https://trello.com",
                "type": "link",
            },
            {
                "title": "Google Calendar - Schedule & Reminders",
                "url": "https://calendar.google.com",
                "type": "link",
            },
            {
                "title": "Habitica - Gamified Habit Tracking",
                "url": "https://habitica.com",
                "type": "link",
            },
            {
                "title": "Toggl Track - Time Tracking",
                "url": "https://toggl.com/track",
                "type": "link",
            },
            {
                "title": "SMART Goals Framework - MindTools",
                "url": "https://www.mindtools.com/arb6g1q/smart-goals",
                "type": "link",
            },
            {
                "title": "Reddit r/GetDisciplined - Productivity Community",
                "url": "https://www.reddit.com/r/getdisciplined",
                "type": "link",
            },
            {
                "title": "Notion Template Gallery - Project Planning",
                "url": "https://www.notion.so/templates/category/project-management",
                "type": "link",
            },
        ],
    }
