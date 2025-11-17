from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import List
import uuid
from datetime import datetime
from supabase import Client
from services.supabase_service import get_supabase_client
from api.schemas.upload import UploadResponse, UploadListResponse

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

# File upload settings
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

BUCKET_NAME = "task-attachments"


@router.post("/tasks/{task_id}", response_model=UploadResponse)
async def upload_file(
    task_id: str,
    file: UploadFile = File(...),
    supabase: Client = Depends(get_supabase_client),
):
    """
    Upload a file for a specific task
    """
    try:
        # Validate file size
        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File size exceeds maximum allowed size of {MAX_FILE_SIZE / (1024*1024)}MB",
            )

        # Validate MIME type
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file.content_type} is not allowed. Allowed types: images, PDFs, Word documents",
            )

        # Generate unique filename
        file_ext = file.filename.split(".")[-1] if "." in file.filename else ""
        unique_filename = f"{task_id}/{uuid.uuid4()}.{file_ext}"

        # Upload to Supabase Storage
        response = supabase.storage.from_(BUCKET_NAME).upload(
            path=unique_filename,
            file=contents,
            file_options={"content-type": file.content_type},
        )

        # Get public URL
        public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(unique_filename)

        # Store metadata in database
        upload_data = {
            "id": str(uuid.uuid4()),
            "task_id": task_id,
            "file_name": file.filename,
            "file_url": public_url,
            "file_size": len(contents),
            "mime_type": file.content_type,
            "uploaded_at": datetime.utcnow().isoformat(),
        }

        result = supabase.table("uploads").insert(upload_data).execute()

        return UploadResponse(**result.data[0])

    except HTTPException:
        raise
    except Exception as e:
        print(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")


@router.get("/tasks/{task_id}", response_model=UploadListResponse)
async def get_task_uploads(
    task_id: str,
    supabase: Client = Depends(get_supabase_client),
):
    """
    Get all uploads for a specific task
    """
    try:
        response = (
            supabase.table("uploads")
            .select("*")
            .eq("task_id", task_id)
            .order("uploaded_at", desc=True)
            .execute()
        )

        return UploadListResponse(uploads=response.data)

    except Exception as e:
        print(f"Error fetching uploads: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch uploads: {str(e)}"
        )


@router.delete("/{upload_id}")
async def delete_upload(
    upload_id: str,
    supabase: Client = Depends(get_supabase_client),
):
    """
    Delete an upload
    """
    try:
        # Get upload info
        upload_response = (
            supabase.table("uploads").select("*").eq("id", upload_id).single().execute()
        )

        if not upload_response.data:
            raise HTTPException(status_code=404, detail="Upload not found")

        upload = upload_response.data

        # Extract file path from URL
        # URL format: https://xxx.supabase.co/storage/v1/object/public/task-attachments/path
        file_path = upload["file_url"].split(f"{BUCKET_NAME}/")[-1]

        # Delete from storage
        supabase.storage.from_(BUCKET_NAME).remove([file_path])

        # Delete from database
        supabase.table("uploads").delete().eq("id", upload_id).execute()

        return {"message": "Upload deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Delete error: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to delete upload: {str(e)}"
        )
