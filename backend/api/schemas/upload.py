from pydantic import BaseModel
from typing import List
from datetime import datetime


class UploadResponse(BaseModel):
    id: str
    task_id: str
    file_name: str
    file_url: str
    file_size: int
    mime_type: str
    uploaded_at: str


class UploadListResponse(BaseModel):
    uploads: List[UploadResponse]
