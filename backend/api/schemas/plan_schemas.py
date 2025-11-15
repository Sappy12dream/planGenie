from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime
from enum import Enum

class PlanStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class ResourceType(str, Enum):
    LINK = "link"
    DOCUMENT = "document"
    VIDEO = "video"
    OTHER = "other"

# Request schemas
class PlanGenerateRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=200, description="Plan title")
    description: str = Field(..., min_length=10, max_length=2000, description="Plan description")
    timeline: Optional[str] = Field(None, description="Desired timeline (e.g., '2 weeks', '1 month')")

# Response schemas
class TaskResponse(BaseModel):
    id: str
    plan_id: str
    title: str
    description: Optional[str]
    status: TaskStatus
    due_date: Optional[date]
    order: int
    created_at: datetime

    class Config:
        from_attributes = True

class ResourceResponse(BaseModel):
    id: str
    plan_id: str
    title: str
    url: str
    type: ResourceType
    created_at: datetime

    class Config:
        from_attributes = True

class PlanResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str]
    status: PlanStatus
    tasks: List[TaskResponse] = []
    resources: List[ResourceResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PlanGenerateResponse(BaseModel):
    plan: PlanResponse
    message: str = "Plan generated successfully"
