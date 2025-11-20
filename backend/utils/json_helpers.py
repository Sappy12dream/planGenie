"""
JSON response handling utilities.
Functions for cleaning and validating JSON responses from AI.
"""

import json
from typing import Dict


def clean_json_response(content: str) -> str:
    """Remove markdown code blocks and other formatting from JSON response."""
    # Remove markdown code blocks
    if content.startswith("```json"):
        content = content[7:]
    elif content.startswith("```"):
        content = content[3:]
    
    if content.endswith("```"):
        content = content[:-3]
    
    content = content.strip()
    
    # Try to find JSON object if there's extra text
    if not content.startswith("{"):
        # Look for the first { and last }
        start = content.find("{")
        end = content.rfind("}")
        if start != -1 and end != -1:
            content = content[start:end+1]
    
    return content.strip()


def validate_plan_structure(plan_data: Dict) -> None:
    """Validate the AI response has required structure."""
    # Check top-level keys
    if "tasks" not in plan_data:
        raise ValueError("Invalid plan structure: missing 'tasks' key")
    
    if "resources" not in plan_data:
        raise ValueError("Invalid plan structure: missing 'resources' key")
    
    # Check tasks list
    tasks = plan_data.get("tasks", [])
    if not isinstance(tasks, list):
        raise ValueError(f"'tasks' must be a list, got {type(tasks).__name__}")
    
    if len(tasks) < 5:
        raise ValueError(f"AI generated too few tasks: {len(tasks)} (minimum 5 required)")
    
    # Validate each task has required fields
    for i, task in enumerate(tasks):
        required_fields = ["title", "description", "order"]
        missing_fields = [field for field in required_fields if field not in task]
        if missing_fields:
            raise ValueError(f"Task {i+1} missing required fields: {missing_fields}")
        
        # Validate field types
        if not isinstance(task.get("title"), str):
            raise ValueError(f"Task {i+1}: 'title' must be a string")
        if not isinstance(task.get("description"), str):
            raise ValueError(f"Task {i+1}: 'description' must be a string")
        if not isinstance(task.get("order"), (int, float)):
            raise ValueError(f"Task {i+1}: 'order' must be a number")
    
    # Check resources list
    resources = plan_data.get("resources", [])
    if not isinstance(resources, list):
        raise ValueError(f"'resources' must be a list, got {type(resources).__name__}")
    
    # Validate each resource
    for i, resource in enumerate(resources):
        required_fields = ["title", "url", "type"]
        missing_fields = [field for field in required_fields if field not in resource]
        if missing_fields:
            raise ValueError(f"Resource {i+1} missing required fields: {missing_fields}")
