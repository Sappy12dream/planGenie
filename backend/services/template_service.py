from typing import List, Dict, Optional
from openai import OpenAI
from config import get_settings
import json
import random

settings = get_settings()
client = OpenAI(api_key=settings.openai_api_key)

class TemplateService:
    """
    Service to manage and return plan templates.
    Combines static templates with AI-generated ones from existing plans.
    """
    
    TEMPLATES = [
        {
            "id": "learn-language",
            "title": "Learn a New Language",
            "description": "A structured approach to reaching conversational fluency in a new language. Includes vocabulary building, grammar study, and immersion practice.",
            "timeline": "3 months",
            "category": "Education",
            "icon": "Languages"
        },
        {
            "id": "run-marathon",
            "title": "Run a Marathon",
            "description": "16-week training program for your first marathon. Covers weekly mileage, long runs, cross-training, and taper weeks.",
            "timeline": "4 months",
            "category": "Health & Fitness",
            "icon": "Activity"
        },
        {
            "id": "launch-startup",
            "title": "Launch a Startup",
            "description": "From idea to MVP launch. Includes market research, product development, legal setup, and go-to-market strategy.",
            "timeline": "6 months",
            "category": "Business",
            "icon": "Rocket"
        },
        {
            "id": "home-declutter",
            "title": "Declutter Your Home",
            "description": "Room-by-room guide to organizing your living space. Focuses on minimalism and creating a stress-free environment.",
            "timeline": "1 month",
            "category": "Lifestyle",
            "icon": "Home"
        },
        {
            "id": "learn-python",
            "title": "Learn Python Programming",
            "description": "Master the basics of Python. Covers syntax, data structures, web development basics, and a final capstone project.",
            "timeline": "2 months",
            "category": "Technology",
            "icon": "Code"
        }
    ]

    # Simple in-memory cache for generated templates
    _generated_cache = []
    _last_generated = 0

    @classmethod
    async def get_all_templates(cls, supabase) -> List[Dict]:
        """Return all available templates (static + generated)."""
        static_templates = cls.TEMPLATES
        
        # Try to get generated templates (cached or new)
        generated_templates = await cls._get_generated_templates(supabase)
        
        return static_templates + generated_templates

    @classmethod
    def get_template_by_id(cls, template_id: str) -> Optional[Dict]:
        """Return a specific template by ID."""
        # Check static first
        for template in cls.TEMPLATES:
            if template["id"] == template_id:
                return template
        
        # Check cache
        for template in cls._generated_cache:
            if template["id"] == template_id:
                return template
                
        return None

    @classmethod
    async def _get_generated_templates(cls, supabase) -> List[Dict]:
        """Fetch high-quality plans and generate templates from them."""
        import time
        
        # Return cache if valid (1 hour TTL)
        if cls._generated_cache and (time.time() - cls._last_generated < 3600):
            return cls._generated_cache

        try:
            # Fetch top 5 completed or high health score plans
            # Note: In a real app, we'd filter by 'public' or similar flag
            # For now, we'll just take some high quality ones as examples
            response = supabase.table("plans")\
                .select("title, description, total_estimated_hours")\
                .eq("status", "completed")\
                .limit(5)\
                .execute()
            
            plans = response.data
            
            if not plans:
                # Fallback to active plans with high health score if no completed ones
                response = supabase.table("plans")\
                    .select("title, description, total_estimated_hours")\
                    .gte("health_score", 80)\
                    .limit(5)\
                    .execute()
                plans = response.data

            if not plans:
                return []

            # Generate templates using AI
            generated = await cls._generate_templates_with_ai(plans)
            
            if generated:
                cls._generated_cache = generated
                cls._last_generated = time.time()
                
            return cls._generated_cache

        except Exception as e:
            print(f"Error generating templates: {e}")
            return []

    @classmethod
    async def _generate_templates_with_ai(cls, plans: List[Dict]) -> List[Dict]:
        """Use OpenAI to generalize plans into templates."""
        if not plans:
            return []

        prompt = f"""
        Analyze these successful user plans and create 3 generalized templates based on them.
        
        Source Plans:
        {json.dumps(plans, indent=2)}
        
        Return a JSON array of templates. Each template must have:
        - id: string (kebab-case, unique)
        - title: string (engaging title)
        - description: string (2 sentences max)
        - timeline: string (e.g. "2 weeks")
        - category: string (one of: Education, Health & Fitness, Business, Lifestyle, Technology, Creative, Other)
        - icon: string (one of: Activity, BookOpen, Briefcase, Code, Home, Rocket, Sparkles)
        
        Make sure the templates are distinct and generalized (not specific to one user).
        """

        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that creates plan templates."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
            )
            
            content = response.choices[0].message.content
            data = json.loads(content)
            
            # Handle both {"templates": [...]} and [...] formats
            templates = data.get("templates", data) if isinstance(data, dict) else data
            
            # Add 'generated-' prefix to IDs to avoid collision
            for t in templates:
                if not t["id"].startswith("generated-"):
                    t["id"] = f"generated-{t['id']}"
                    
            return templates

        except Exception as e:
            print(f"AI Template Generation Error: {e}")
            return []
