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
    """Build the optimized main prompt for plan generation with AI intelligence metadata."""
    
    if plan_type is None:
        plan_type = "default"
    
    categories = TASK_CATEGORIES.get(plan_type, TASK_CATEGORIES["default"])
    categories_list = ", ".join(categories)
    
    timeline_text = f"Timeline: {timeline}" if timeline else "Timeline: Not specified"
    
    prompt = f"""Create a detailed, actionable plan with intelligent metadata for:

**Title**: {title}
**Description**: {description}
**{timeline_text}**

Generate 8-12 tasks organized into these categories: {categories_list}

For each task, provide:

1. **Title format**: "[Category Emoji] Category: Specific task name"
   Example: "📋 Planning: Research and compare flight options"

2. **Description** (2-4 sentences):
   - What needs to be done (specific actions)
   - Key steps or sub-tasks
   - Important details: costs, tools, timeframes, specific recommendations
   - Pro tip or common pitfall to avoid

3. **Intelligence Metadata** (NEW - REQUIRED):
   - **estimated_time_hours**: Realistic time estimate in hours (as decimal, e.g., 2.5 for 2.5 hours)
   - **difficulty**: Rate 1-5 (1=very easy, 2=easy, 3=medium, 4=hard, 5=very hard)
   - **estimated_cost_usd**: Estimated cost in USD (0 if no cost, null if unknown)
   - **tools_needed**: Array of specific tools/platforms/software required (e.g., ["Google Flights", "Credit card"])
   - **prerequisites**: Array of task order numbers that should be completed first (e.g., [1, 2] means tasks 1 and 2 should be done first)
   - **tags**: Array of relevant tags (e.g., ["urgent", "requires_payment", "online", "research"])

4. **Be specific**:
   - Name actual tools/platforms/services (not generic "use a website")
   - Include price ranges when relevant (e.g., "$50-100" or "₹5,000")
   - Mention specific brands/providers when helpful
   - Make time estimates realistic (consider research, decision-making, execution, and verification time)

EXAMPLE - Enhanced Task:
{{
    "title": "📋 Planning: Research and compare flight options",
    "description": "Use Google Flights or Skyscanner to compare prices from your departure city. Filter for your preferred dates and set price alerts if costs are above budget. Consider booking 6-8 weeks in advance for best prices (typically $400-700 for domestic, $800-1500 for international). Pro tip: Check prices on Tuesday/Wednesday for potential 10-20% savings.",
    "order": 1,
    "estimated_time_hours": 1.5,
    "difficulty": 2,
    "estimated_cost_usd": 0,
    "tools_needed": ["Google Flights", "Skyscanner", "Email for alerts"],
    "prerequisites": [],
    "tags": ["research", "online", "price_comparison"]
}}

{{
    "title": "🎒 Preparation: Book flight tickets",
    "description": "Based on your research, book the best flight option. Have your passport details and payment method ready. Screenshot confirmation and save booking reference. Most airlines allow free cancellation within 24 hours if you change your mind.",
    "order": 4,
    "estimated_time_hours": 0.75,
    "difficulty": 2,
    "estimated_cost_usd": 600,
    "tools_needed": ["Credit card", "Passport", "Airline website"],
    "prerequisites": [1],
    "tags": ["requires_payment", "online", "booking", "time_sensitive"]
}}

Also include 6-10 relevant resources with:
- Specific, useful URLs (actual booking sites, tutorials, tools)
- Clear titles (not generic like "Travel Website")
- Mix of types: booking platforms, guides, tools, communities

CRITICAL RULES:
- Distribute tasks across all categories (aim for 2-3 tasks per category)
- Order tasks logically (planning → preparation → execution → review)
- Make time estimates realistic (account for research, thinking, doing, verifying)
- Difficulty should reflect skill level needed (1=anyone can do, 5=expert level)
- Prerequisites should reference task order numbers (1-based indexing)
- Cost should be 0 for free tasks, null if truly unknown, or actual USD estimate
- Tools should list specific brands/platforms, not generic descriptions
- Tags should be lowercase with underscores (snake_case)
- No placeholder text or "TBD"
- MUST respond with valid JSON only - no markdown, no code blocks, no extra text

JSON SCHEMA (respond with ONLY this structure):
{{
    "tasks": [
        {{
            "title": "string with category prefix",
            "description": "string (2-4 sentences)",
            "order": number (1-indexed),
            "estimated_time_hours": number (decimal),
            "difficulty": number (1-5),
            "estimated_cost_usd": number or null,
            "tools_needed": ["string", "string"],
            "prerequisites": [number, number] (task order numbers),
            "tags": ["string", "string"]
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
