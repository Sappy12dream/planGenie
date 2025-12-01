from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

# User Preferences Schemas
class UserPreferencesResponse(BaseModel):
    user_id: UUID
    email_notifications: bool
    task_reminders: bool
    weekly_digest: bool
    reminder_time_hours: int
    digest_day_of_week: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserPreferencesUpdateRequest(BaseModel):
    email_notifications: Optional[bool] = None
    task_reminders: Optional[bool] = None
    weekly_digest: Optional[bool] = None
    reminder_time_hours: Optional[int] = Field(None, ge=1, le=168) # 1 hour to 1 week
    digest_day_of_week: Optional[int] = Field(None, ge=0, le=6) # 0=Sunday, 6=Saturday

# Dashboard Alert Schemas
class DashboardAlertResponse(BaseModel):
    id: UUID
    user_id: UUID
    type: str
    priority: int
    task_id: Optional[UUID]
    plan_id: Optional[UUID]
    title: str
    message: str
    action_label: Optional[str]
    action_url: Optional[str]
    created_at: datetime
    dismissed_at: Optional[datetime]

    class Config:
        from_attributes = True

class AlertGenerateResponse(BaseModel):
    message: str
    count: int
