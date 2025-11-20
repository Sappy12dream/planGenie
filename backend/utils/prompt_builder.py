"""
Prompt building utilities for plan generation.
Handles plan type detection and prompt construction.
"""

from typing import Dict
from openai import OpenAI
from utils.plan_config import TASK_CATEGORIES, PLAN_TYPE_KEYWORDS


def determine_plan_type(title: str, description: str, client: OpenAI) -> str:
    """
    Determine the plan type using LLM for accurate classification.
    Falls back to keyword matching if LLM call fails.
    """
    try:
        # Use LLM for intelligent plan type detection
        classification_prompt = f"""Classify this plan into ONE of these categories: travel, learning, fitness, project, event, or default.

Plan Title: {title}
Plan Description: {description}

Respond with ONLY the category name (one word): travel, learning, fitness, project, event, or default.

Guidelines:
- travel: trips, vacations, tours, visiting places
- learning: courses, studying, skill development, education
- fitness: workouts, health, diet, exercise programs
- project: building things, creating products, development work
- event: planning parties, weddings, conferences, gatherings
- default: anything that doesn't clearly fit the above

Category:"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a plan classification expert. Respond with only one word."},
                {"role": "user", "content": classification_prompt}
            ],
            temperature=0.3,
            max_tokens=10,
        )
        
        plan_type = response.choices[0].message.content.strip().lower()
        
        # Validate the response
        valid_types = ["travel", "learning", "fitness", "project", "event", "default"]
        if plan_type in valid_types:
            return plan_type
        
        # If invalid response, fall back to keyword matching
        print(f"Invalid LLM classification: {plan_type}, falling back to keyword matching")
        return determine_plan_type_fallback(title, description)
    
    except Exception as e:
        print(f"LLM classification error: {e}, using keyword fallback")
        return determine_plan_type_fallback(title, description)


def determine_plan_type_fallback(title: str, description: str) -> str:
    """Fallback keyword-based plan type detection."""
    content = f"{title} {description}".lower()
    
    # Find best match
    for plan_type, words in PLAN_TYPE_KEYWORDS.items():
        if any(word in content for word in words):
            return plan_type
    
    return "default"


def build_plan_prompt(title: str, description: str, timeline: str = None, plan_type: str = None) -> str:
    """Build the optimized main prompt for plan generation."""
    
    if plan_type is None:
        plan_type = "default"
    
    categories = TASK_CATEGORIES.get(plan_type, TASK_CATEGORIES["default"])
    categories_list = ", ".join(categories)
    
    timeline_text = f"Timeline: {timeline}" if timeline else "Timeline: Not specified"
    
    prompt = f"""Create a detailed, actionable plan for:

**Title**: {title}
**Description**: {description}
**{timeline_text}**

Generate 8-12 tasks organized into these categories: {categories_list}

For each task:
1. **Title format**: "[Category Emoji] Category: Specific task name"
   Example: "📋 Planning: Research and compare flight options"

2. **Description** (2-4 sentences):
   - What needs to be done (specific actions)
   - Key steps or sub-tasks (use bullet points)
   - Important details: costs, tools, timeframes, specific recommendations
   - Pro tip or common pitfall to avoid

3. **Be specific**:
   - Name actual tools/platforms/services (not generic "use a website")
   - Include price ranges when relevant (e.g., "$50-100" or "₹5,000")
   - Mention specific brands/providers when helpful
   - Give concrete examples

4. **Keep it actionable**: Someone should know exactly what to do after reading the task.

EXAMPLE - Good Task:
{{
    "title": "📋 Planning: Research and compare flight options",
    "description": "Use Google Flights or Skyscanner to compare prices from your departure city. Filter for your preferred dates and set price alerts if costs are above budget. Consider booking 6-8 weeks in advance for best prices (typically $400-700 for domestic, $800-1500 for international). Pro tip: Check prices on Tuesday/Wednesday for potential 10-20% savings.",
    "order": 1
}}

EXAMPLE - Bad Task (avoid):
{{
    "title": "Book flights",
    "description": "Find and book flights for your trip using travel websites.",
    "order": 1
}}

Also include 6-10 relevant resources with:
- Specific, useful URLs (actual booking sites, tutorials, tools)
- Clear titles (not generic like "Travel Website")
- Mix of types: booking platforms, guides, tools, communities

CRITICAL:
- Distribute tasks across all categories (aim for 2-3 tasks per category)
- Order tasks logically (planning → preparation → execution → review)
- No placeholder text or "TBD"
- Be practical and realistic
- MUST respond with valid JSON only - no markdown, no code blocks, no extra text

JSON SCHEMA (respond with ONLY this structure):
{{
    "tasks": [
        {{
            "title": "string with category prefix",
            "description": "string (2-4 sentences)",
            "order": number
        }}
    ],
    "resources": [
        {{
            "title": "string",
            "url": "string",
            "type": "link|document|video|other"
        }}
    ]
}}

Response (valid JSON only):"""
    
    return prompt
