from pydantic import BaseModel, Field
from typing import Optional
from datetime import date
from enum import Enum

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class TaskCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    due_date: Optional[date] = None
    order: int = Field(default=0)

class TaskUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[TaskStatus] = None
    due_date: Optional[date] = None
    order: Optional[int] = None

class TaskReorderRequest(BaseModel):
    task_id: str
    new_order: int

class TaskBulkReorderRequest(BaseModel):
    tasks: list[TaskReorderRequest]
