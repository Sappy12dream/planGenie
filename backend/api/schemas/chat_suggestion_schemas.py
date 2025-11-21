from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class SuggestionType(str, Enum):
    NEXT_TASK = "next_task"
    ADD_TASK = "add_task"
    OPTIMIZE = "optimize"
    WARNING = "warning"
    BREAKDOWN = "breakdown"

class SuggestionPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class SuggestionStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    DISMISSED = "dismissed"

class ChatSuggestionBase(BaseModel):
    plan_id: str
    suggestion_type: SuggestionType
    priority: SuggestionPriority = SuggestionPriority.MEDIUM
    title: str
    description: str
    actionable: bool = True
    action_button_text: Optional[str] = None
    related_task_ids: List[str] = []
    confidence_score: float = Field(..., ge=0, le=1)
    reasoning: Optional[str] = None

class ChatSuggestionCreate(ChatSuggestionBase):
    user_id: str

class ChatSuggestionResponse(ChatSuggestionBase):
    id: str
    user_id: str
    status: SuggestionStatus
    shown_at: Optional[datetime] = None
    acted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
