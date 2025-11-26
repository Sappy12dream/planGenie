from typing import List, Dict, Optional

class TemplateService:
    """
    Service to manage and return plan templates.
    Currently uses a static list, but could be extended to fetch from DB.
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

    @classmethod
    def get_all_templates(cls) -> List[Dict]:
        """Return all available templates."""
        return cls.TEMPLATES

    @classmethod
    def get_template_by_id(cls, template_id: str) -> Optional[Dict]:
        """Return a specific template by ID."""
        for template in cls.TEMPLATES:
            if template["id"] == template_id:
                return template
        return None
