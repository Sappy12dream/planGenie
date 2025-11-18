from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class SubtaskCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None

class SubtaskUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(pending|in_progress|completed)$")
    order: Optional[int] = None

class SubtaskResponse(BaseModel):
    id: str
    task_id: str
    title: str
    description: Optional[str]
    status: str
    order: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SubtaskGenerateRequest(BaseModel):
    task_id: str
    task_title: str
    task_description: Optional[str] = None
