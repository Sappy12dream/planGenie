"""
Constants and configuration for plan generation.
Contains task categories, prompts, and system messages.
"""

# System prompt for the AI
SYSTEM_PROMPT = """You are PlanGenie, an expert AI planning assistant that creates organized, actionable plans.

Your plans are:
- Well-structured with clear categories
- Specific and actionable (no vague suggestions)
- Concise but comprehensive (2-4 sentences per task)
- Practical with real recommendations

Always provide concrete details: specific tools, estimated costs, time requirements, and relevant resources.

IMPORTANT: You MUST respond with valid JSON only. No markdown formatting, no code blocks, no explanatory text before or after the JSON."""

# Task categories for different plan types
TASK_CATEGORIES = {
    "travel": ["📋 Planning", "🎒 Preparation", "✈️ Execution", "📸 Experience"],
    "learning": ["📋 Planning", "🎒 Setup", "📚 Learning", "💡 Practice", "✅ Review"],
    "fitness": ["📋 Planning", "🎒 Preparation", "💪 Training", "📊 Tracking"],
    "project": ["📋 Planning", "🎒 Setup", "🔨 Development", "🧪 Testing", "🚀 Launch"],
    "event": ["📋 Planning", "🎒 Preparation", "🎉 Execution", "✅ Follow-up"],
    "default": ["📋 Planning", "🎒 Preparation", "⚡ Execution", "✅ Review & Adjust"]
}

# Keywords for plan type detection fallback
PLAN_TYPE_KEYWORDS = {
    "travel": ["trip", "travel", "vacation", "visit", "tour", "destination"],
    "learning": ["learn", "course", "study", "master", "tutorial", "skill"],
    "fitness": ["fitness", "workout", "exercise", "gym", "weight", "health", "diet"],
    "project": ["build", "create", "develop", "project", "app", "website", "software"],
    "event": ["event", "party", "wedding", "conference", "meetup", "gathering"]
}
