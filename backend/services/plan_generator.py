from openai import OpenAI
from config import get_settings
import json
from typing import Dict, List

settings = get_settings()
client = OpenAI(api_key=settings.openai_api_key)


def generate_plan_with_ai(title: str, description: str, timeline: str = None) -> Dict:
    """
    Generate a comprehensive, ultra-detailed plan using OpenAI GPT-4
    
    Args:
        title: Plan title
        description: Plan description
        timeline: Optional timeline (e.g., "2 weeks", "1 month")
    
    Returns:
        Dictionary with detailed tasks and resources
    """
    
    # Build the prompt
    timeline_text = f" within {timeline}" if timeline else ""
    
    prompt = f"""You are PlanGenie, an expert AI planning assistant that creates ULTRA-DETAILED, actionable plans with specific recommendations and multiple options.

Title: {title}
Description: {description}
Timeline: {timeline_text if timeline else "No specific timeline provided"}

Your mission is to create a COMPREHENSIVE plan that someone can follow WITHOUT doing any additional research. You must:

1. **Be EXTREMELY SPECIFIC** - Include exact details, not vague suggestions
   - For travel: Suggest specific hotels with price ranges, exact routes with timings, meal recommendations
   - For learning: Recommend specific courses/tutorials with URLs, time estimates per module
   - For projects: List exact tools/software versions, setup commands, folder structures
   - For fitness: Provide specific exercises with reps/sets, meal plans with calories
   - For events: Venue suggestions with capacity, vendor recommendations with contact info

2. **Provide MULTIPLE OPTIONS** in task descriptions (when applicable)
   - **Option A (Premium/Recommended)**: Higher quality option with specifics and why it's best
   - **Option B (Mid-Range/Balanced)**: Good balance of quality and cost with details
   - **Option C (Budget/Basic)**: Most affordable or free option with specifics
   - Include pros/cons for each option when relevant

3. **Include PRACTICAL DETAILS**
   - Exact costs with currency (e.g., "₹15,000" or "$50-100")
   - Time estimates (e.g., "2-3 hours", "Day 1: 9 AM - 12 PM")
   - Specific brands, services, platforms, or vendors
   - Prerequisites or requirements clearly stated
   - Tools/equipment/materials needed with where to get them
   - Potential obstacles and how to overcome them
   - Pro tips from someone experienced in this area

4. **Break down into 10-15 DETAILED tasks**
   - Each task description should be 5-8 sentences minimum
   - Include WHO should do it, WHAT exactly to do, WHEN to do it, WHERE to do it, HOW MUCH it costs
   - Mention specific brands, services, websites, or platforms
   - Add insider tips or common mistakes to avoid
   - For complex tasks, break down into numbered sub-steps

5. **Add 8-12 HIGH-QUALITY, RELEVANT resources**
   - Official documentation or booking sites
   - Specific tutorial videos or online courses (with URLs)
   - Comparison/review sites for decision-making
   - Tools, apps, or software needed
   - Community forums or support groups
   - Booking platforms or marketplaces

EXAMPLE OF EXCELLENT TASK (Travel Planning):
Title: "Book accommodation in Udaipur for 13 people (3 nights, Nov 15-18)"
Description: "You need 3-4 rooms for 13 people for 3 nights in Udaipur.

**Option A (Luxury Experience - ₹180,000 total)**: The Oberoi Udaivillas - This 5-star property offers lake-facing rooms with private balconies and complimentary breakfast. Book 4 Premier Rooms at ₹15,000/night each (₹60,000 per night x 3 nights = ₹180,000 total). Each room accommodates 3-4 people comfortably. Book directly via their website (oberoisudaivillas.com) or Booking.com for best rates. Includes private boat access to City Palace, infinity pool, and spa. Best for: Special occasions, honeymoons in the group.

**Option B (Mid-Range Comfort - ₹48,000 total)**: Hotel Lakend - Well-rated 3-star hotel (4.2★ on TripAdvisor, 1,200+ reviews) in city center, walking distance to Lake Pichola. Book 4 Deluxe Rooms at ₹4,000/night each (₹16,000 per night x 3 nights = ₹48,000 total). Clean AC rooms with attached bathrooms, complimentary breakfast, rooftop restaurant. Request adjacent rooms for the group. Book via Booking.com (free cancellation up to 3 days). Best for: Most groups - great value.

**Option C (Budget Friendly - ₹30,000 total)**: Zostel Udaipur - Highly-rated hostel with private rooms perfect for groups. Book 4 Private Rooms at ₹2,500/night each (₹10,000 per night x 3 nights = ₹30,000 total). Each room has 3-4 beds, AC, clean shared bathrooms. Includes rooftop cafe with lake views, common area for group gatherings, friendly staff. Book directly on zostel.com for best prices. Best for: Backpackers, young groups, budget-conscious travelers.

**Pro Tips**: (1) Book at least 2-3 months in advance for better rates and availability, (2) Request adjacent or nearby rooms for group convenience, (3) Check if hotel offers group discounts for 10+ people, (4) Verify cancellation policy - aim for free cancellation up to 7 days before, (5) Read recent reviews on Google Maps and TripAdvisor before booking, (6) WhatsApp the hotel directly after booking to confirm group arrangement.

**Common Mistakes**: Don't book without checking location on Google Maps - some hotels are far from main attractions. Don't book non-refundable rates unless you're 100% certain of dates."

EXAMPLE OF BAD TASK (Avoid this):
Title: "Book accommodation"
Description: "Find hotels in Udaipur and book them. Use Booking.com or similar websites to search for options that fit your budget."

---

NOW CREATE THE DETAILED PLAN:

Respond in valid JSON format with this exact structure:
{{
    "tasks": [
        {{
            "title": "Specific task title with key details (e.g., dates, quantities, locations)",
            "description": "5-8 sentence detailed description with multiple options (A/B/C when applicable), specific recommendations, exact costs, timings, pro tips, and common mistakes to avoid",
            "order": 1
        }}
    ],
    "resources": [
        {{
            "title": "Specific resource name (not generic like 'Travel website')",
            "url": "https://actual-working-url.com",
            "type": "link"
        }}
    ]
}}

Resource types: "link", "document", "video", "other"

CRITICAL REQUIREMENTS:
- Be hyper-specific with numbers, names, costs, timings, brands
- Always provide 2-3 detailed options when there are choices to make
- Include practical warnings, tips, and common mistakes
- Make descriptions long enough (5-8 sentences) to be truly actionable
- Think like an experienced expert who's done this 100 times
- No placeholders or "TBD" - give actual recommendations
- Include URLs to real, helpful resources (not example.com)"""

    try:
        # Call OpenAI API with GPT-4 for better quality
        response = client.chat.completions.create(
            model="gpt-4o",  # Using GPT-4 for superior quality
            messages=[
                {
                    "role": "system",
                    "content": "You are PlanGenie, an elite planning assistant that creates ULTRA-DETAILED, comprehensive plans with specific recommendations, multiple options, exact costs, and practical insider tips. You never give vague advice - every suggestion is specific, actionable, and based on real-world experience. You're like having a knowledgeable friend who's an expert in every field."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=4000  # Increased for detailed responses
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
        if len(plan_data.get("tasks", [])) < 5:
            raise ValueError("AI generated too few tasks")
        
        return plan_data
        
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        print(f"Response content: {content}")
        return create_fallback_plan(title, description, timeline)
    
    except Exception as e:
        print(f"AI generation error: {e}")
        raise


def create_fallback_plan(title: str, description: str, timeline: str = None) -> Dict:
    """Create a detailed fallback plan if AI fails"""
    return {
        "tasks": [
            {
                "title": "Research and define ultra-specific, measurable objectives",
                "description": f"Break down '{title}' into 3-5 SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound). Instead of vague goals like 'learn Python', write 'Complete 30 LeetCode Easy problems and build 3 small projects within 4 weeks'. For each goal, define: (1) Exact success criteria (what does done look like?), (2) How you'll measure progress (daily/weekly metrics), (3) Resources needed (time, money, tools). Document in a spreadsheet or Notion with columns for Goal, Success Criteria, Measurement Method, Deadline, and Status. Review this daily.",
                "order": 1
            },
            {
                "title": "Create comprehensive resource inventory with specific items and costs",
                "description": f"List EVERY resource needed for '{title}' with specific details. **Tools**: Name exact software (e.g., 'VS Code 1.85, Python 3.11, PostgreSQL 14'), include download links. **Courses**: List specific courses (e.g., 'Complete Python Bootcamp by Jose Portilla on Udemy, $15, 22 hours') with URLs. **Budget**: Break down all costs - subscriptions ($X/month), one-time purchases ($Y), estimated time value (Z hours/week at your hourly rate). **Alternatives**: For each paid resource, list a free alternative (e.g., 'freeCodeCamp Python course, free, 40 hours'). Create a comparison table to make informed decisions.",
                "order": 2
            },
            {
                "title": "Design week-by-week detailed milestone roadmap with specific deliverables",
                "description": f"Create a granular timeline{f' fitting your {timeline} deadline' if timeline else ''}. Break into weekly milestones with 3-5 concrete deliverables each. **Week 1 Example**: (1) Install all required software and test setup, (2) Complete chapters 1-3 of main course, (3) Build first practice project following tutorial, (4) Join 2 online communities and introduce yourself, (5) Set up daily habit tracking. For each week, estimate hours needed (be realistic, add 20% buffer). Identify dependencies (Week 2 can't start without Week 1 completion). Use project management tools like Notion, Trello, or Asana to visualize timeline.",
                "order": 3
            },
            {
                "title": "Conduct comprehensive risk assessment with detailed contingency plans",
                "description": "List 7-10 things that could derail your plan. For each risk: **Risk**: 'Getting stuck on complex concepts' (Likelihood: High, Impact: High). **Prevention**: Allocate 2 hours/week for Q&A sessions, join Discord study groups. **Contingency**: If stuck >2 hours, book 1-hour mentor session on Codementor ($30-50) or post on Stack Overflow. **Budget Impact**: Keep $100-200 emergency learning fund. Other common risks: time constraints (solution: reduce scope by 20%), lost motivation (solution: accountability partner + gamification), unexpected life events (solution: build 30% time buffer). Rate each risk as High/Medium/Low for both likelihood and impact.",
                "order": 4
            },
            {
                "title": "Implement robust progress tracking dashboard with key metrics",
                "description": "Set up comprehensive tracking system. **Tool Options**: (A) Google Sheets (free, customizable), (B) Notion (free, beautiful templates), (C) Airtable (free tier, database-style). **Track These Metrics**: (1) Time spent daily (use Toggl or RescueTime), (2) Tasks completed vs planned (%), (3) Quality self-rating (1-10 scale with criteria), (4) Energy levels (morning/afternoon/evening), (5) Blockers encountered (log each with resolution time), (6) Learning velocity (concepts mastered per week). **Review Schedule**: 5-min daily check-in (before bed), 30-min weekly deep dive (Sunday evening), monthly retrospective with adjustments. Set up automated reminders.",
                "order": 5
            },
            {
                "title": "Establish multi-layered accountability system with specific commitments",
                "description": "Build accountability through: **Layer 1 - Accountability Partner**: Find someone with similar goals. Meet bi-weekly (30 min video calls), share weekly progress reports, set consequences for missed commitments (e.g., $20 donation to charity). Use platforms like Focusmate or r/GetStudying to find partners. **Layer 2 - Community**: Join 2-3 online communities (Discord servers, subreddits, Slack groups), post weekly updates (builds social pressure), help others (reinforces learning). **Layer 3 - Public Commitment**: Tweet/post your goal and weekly progress (social accountability). **Layer 4 - Coach/Mentor**: Optional but powerful - hire coach ($50-150/session) for monthly check-ins.",
                "order": 6
            },
            {
                "title": "Execute Phase 1 with hour-by-hour daily schedules and specific tasks",
                "description": "Start with FIRST week's milestone. Create detailed daily schedule: **Monday Example**: 6:00-6:30 AM: Review goals and plan day. 9:00-10:30 AM: Read Chapter 1 (25 pages, take notes), 10:30-11:00 AM: Break + review notes. 11:00-12:30 PM: Watch tutorial video 1 (1.5 hrs), do exercises. 2:00-3:00 PM: Complete 5 practice problems, document solutions. 3:00-3:30 PM: Join Discord, ask 2 questions, help 1 person. Use **Time Blocking**: Assign specific tasks to specific time slots. Use **Pomodoro Technique**: 25 min focused work, 5 min break. **Energy Management**: Do hardest tasks during peak energy hours (usually morning). Track actual vs planned time to improve estimates.",
                "order": 7
            },
            {
                "title": "Conduct thorough weekly reviews with data-driven adjustments",
                "description": "Every Sunday 7-8 PM, complete structured review. **Part 1 - Wins Analysis** (10 min): What went exceptionally well? What specific actions led to success? How can you replicate this? **Part 2 - Gaps Analysis** (10 min): What didn't get done? Root cause analysis (time, energy, skills, motivation?). Which gaps matter most? **Part 3 - Blocker Resolution** (15 min): What's currently blocking progress? For each blocker, brainstorm 3 solutions, pick 1 to implement this week. **Part 4 - Plan Adjustment** (15 min): Based on learnings, adjust next week's plan. If consistently behind, reduce scope by 15-20% OR extend timeline. **Part 5 - Celebration** (10 min): Acknowledge progress, treat yourself. Share wins with accountability partner. Document insights in journal for future reference.",
                "order": 8
            }
        ],
        "resources": [
            {
                "title": "Notion - Free Project Planning Templates",
                "url": "https://www.notion.so/templates/category/project-management",
                "type": "link"
            },
            {
                "title": "Trello - Visual Task Management (Free)",
                "url": "https://trello.com",
                "type": "link"
            },
            {
                "title": "Toggl Track - Time Tracking Tool",
                "url": "https://toggl.com/track",
                "type": "link"
            },
            {
                "title": "Focusmate - Virtual Co-working for Accountability",
                "url": "https://www.focusmate.com",
                "type": "link"
            },
            {
                "title": "Habitica - Gamified Habit Tracking",
                "url": "https://habitica.com",
                "type": "link"
            },
            {
                "title": "SMART Goals Complete Guide - MindTools",
                "url": "https://www.mindtools.com/arb6g1q/smart-goals",
                "type": "link"
            },
            {
                "title": "Project Management Institute - Planning Guide",
                "url": "https://www.pmi.org/learning/library/beginners-guide-project-management",
                "type": "link"
            },
            {
                "title": "Reddit r/GetStudying - Accountability Community",
                "url": "https://www.reddit.com/r/GetStudying",
                "type": "link"
            }
        ]
    }
