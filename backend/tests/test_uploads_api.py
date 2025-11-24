import pytest
from unittest.mock import Mock, patch, MagicMock
from uuid import uuid4
from io import BytesIO


class TestFileUpload:
    """Tests for file upload functionality"""

    @patch("api.routes.uploads.get_supabase_client")
    @patch("api.routes.uploads.storage_client")
    def test_upload_file_success(
        self,
        mock_storage,
        mock_get_supabase,
        client,
        mock_task_id,
        mock_user_id,
    ):
        """Test successful file upload"""
        mock_supabase = Mock()
        mock_get_supabase.return_value = mock_supabase

        # Mock task ownership check
        task_result = Mock()
        task_result.data = [{"id": mock_task_id, "plan_id": str(uuid4())}]

        plan_result = Mock()
        plan_result.data = [{"user_id": mock_user_id}]

        mock_table = Mock()
        mock_supabase.table.return_value = mock_table

        select_chain = Mock()
        select_chain.eq.return_value.execute.side_effect = [task_result, plan_result]
        mock_table.select.return_value = select_chain

        # Mock storage upload
        mock_storage.from_.return_value.upload.return_value = {"path": "test.png"}
        mock_storage.from_.return_value.get_public_url.return_value = (
            "https://example.com/test.png"
        )

        # Mock upload record insert
        upload_result = Mock()
        upload_result.data = [
            {
                "id": str(uuid4()),
                "task_id": mock_task_id,
                "file_name": "test.png",
                "file_url": "https://example.com/test.png",
                "file_size": 1024,
                "mime_type": "image/png",
            }
        ]

        insert_chain = Mock()
        insert_chain.execute.return_value = upload_result
        mock_table.insert.return_value = insert_chain

        # Create a fake file
        fake_file = BytesIO(b"fake image content")
        fake_file.name = "test.png"

        response = client.post(
            f"/api/uploads/tasks/{mock_task_id}",
            files={"file": ("test.png", fake_file, "image/png")},
        )

        assert response.status_code == 201
        data = response.json()
        assert "file_url" in data
        assert data["file_name"] == "test.png"

    @patch("api.routes.uploads.get_supabase_client")
    def test_upload_file_too_large(self, mock_get_supabase, client, mock_task_id):
        """Test file upload exceeding size limit"""
        mock_supabase = Mock()
        mock_get_supabase.return_value = mock_supabase

        # Mock task ownership check
        task_result = Mock()
        task_result.data = [{"id": mock_task_id, "plan_id": str(uuid4())}]
        plan_result = Mock()
        plan_result.data = [{"user_id": str(uuid4())}]

        mock_table = Mock()
        mock_supabase.table.return_value = mock_table
        select_chain = Mock()
        select_chain.eq.return_value.execute.side_effect = [task_result, plan_result]
        mock_table.select.return_value = select_chain

        # Create a large fake file (11MB, over 10MB limit)
        large_file = BytesIO(b"x" * (11 * 1024 * 1024))
        large_file.name = "large.png"

        response = client.post(
            f"/api/uploads/tasks/{mock_task_id}",
            files={"file": ("large.png", large_file, "image/png")},
        )

        assert response.status_code == 400
        data = response.json()
        assert "size" in data["detail"].lower()

    @patch("api.routes.uploads.get_supabase_client")
    def test_upload_invalid_file_type(self, mock_get_supabase, client, mock_task_id):
        """Test uploading unsupported file type"""
        mock_supabase = Mock()
        mock_get_supabase.return_value = mock_supabase

        # Mock task ownership check
        task_result = Mock()
        task_result.data = [{"id": mock_task_id, "plan_id": str(uuid4())}]
        plan_result = Mock()
        plan_result.data = [{"user_id": str(uuid4())}]

        mock_table = Mock()
        mock_supabase.table.return_value = mock_table
        select_chain = Mock()
        select_chain.eq.return_value.execute.side_effect = [task_result, plan_result]
        mock_table.select.return_value = select_chain

        # Create a file with unsupported type
        fake_file = BytesIO(b"executable content")
        fake_file.name = "virus.exe"

        response = client.post(
            f"/api/uploads/tasks/{mock_task_id}",
            files={"file": ("virus.exe", fake_file, "application/x-msdownload")},
        )

        assert response.status_code == 400
        data = response.json()
        assert "type" in data["detail"].lower()

    def test_upload_no_file(self, client, mock_task_id):
        """Test upload endpoint with no file"""
        response = client.post(f"/api/uploads/tasks/{mock_task_id}")

        assert response.status_code == 422


class TestDeleteUpload:
    """Tests for file deletion"""

    @patch("api.routes.uploads.get_supabase_client")
    @patch("api.routes.uploads.storage_client")
    def test_delete_upload_success(
        self, mock_storage, mock_get_supabase, client, mock_user_id
    ):
        """Test successful file deletion"""
        upload_id = str(uuid4())
        mock_supabase = Mock()
        mock_get_supabase.return_value = mock_supabase

        # Mock upload ownership check
        upload_result = Mock()
        upload_result.data = [
            {
                "id": upload_id,
                "task_id": str(uuid4()),
                "file_url": "https://example.com/test.png",
            }
        ]

        task_result = Mock()
        task_result.data = [{"plan_id": str(uuid4())}]

        plan_result = Mock()
        plan_result.data = [{"user_id": mock_user_id}]

        mock_table = Mock()
        mock_supabase.table.return_value = mock_table

        select_chain = Mock()
        select_chain.eq.return_value.execute.side_effect = [
            upload_result,
            task_result,
            plan_result,
        ]
        mock_table.select.return_value = select_chain

        # Mock storage deletion
        mock_storage.from_.return_value.remove.return_value = {"status": "success"}

        # Mock database deletion
        delete_result = Mock()
        delete_result.data = [{"id": upload_id}]
        delete_chain = Mock()
        delete_chain.eq.return_value.execute.return_value = delete_result
        mock_table.delete.return_value = delete_chain

        response = client.delete(f"/api/uploads/{upload_id}")

        assert response.status_code == 204

    @patch("api.routes.uploads.get_supabase_client")
    def test_delete_upload_not_found(self, mock_get_supabase, client):
        """Test deleting non-existent upload"""
        upload_id = str(uuid4())
        mock_supabase = Mock()
        mock_get_supabase.return_value = mock_supabase

        # Mock empty upload result
        upload_result = Mock()
        upload_result.data = []

        mock_table = Mock()
        mock_supabase.table.return_value = mock_table
        select_chain = Mock()
        select_chain.eq.return_value.execute.return_value = upload_result
        mock_table.select.return_value = select_chain

        response = client.delete(f"/api/uploads/{upload_id}")

        assert response.status_code == 404
