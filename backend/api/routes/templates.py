from fastapi import APIRouter, HTTPException
from typing import List, Dict
from services.template_service import TemplateService

router = APIRouter(
    prefix="/api/templates",
    tags=["templates"]
)

@router.get("", response_model=List[Dict])
async def get_templates():
    """
    Get all available plan templates.
    """
    return TemplateService.get_all_templates()

@router.get("/{template_id}", response_model=Dict)
async def get_template(template_id: str):
    """
    Get a specific template by ID.
    """
    template = TemplateService.get_template_by_id(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template
