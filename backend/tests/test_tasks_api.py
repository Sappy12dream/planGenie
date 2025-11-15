import pytest
from unittest.mock import Mock, patch


class TestCreateTask:
    """Tests for task creation endpoint"""

    @patch("api.routes.tasks.get_supabase_client")
    def test_create_task_success(
        self,
        mock_get_supabase,
        client,
        mock_plan_id,
        sample_task_data,
        sample_plan_data,
    ):
        """Test successful task creation"""
        mock_supabase = Mock()
        mock_get_supabase.return_value = mock_supabase

        # Mock plan ownership check
        plan_result = Mock()
        plan_result.data = [{"user_id": "6c631abd-435b-4c87-b5af-c2e01023c318"}]

        # Mock existing tasks query (for order calculation)
        existing_tasks_result = Mock()
        existing_tasks_result.data = [{"order": 0}, {"order": 1}]

        # Mock task insert
        task_result = Mock()
        task_result.data = [sample_task_data]

        # Setup mock chain
        mock_table = Mock()
        mock_supabase.table.return_value = mock_table

        def mock_operations(*args, **kwargs):
            chain = Mock()
            chain.eq.return_value.execute.return_value = plan_result
            chain.insert.return_value.execute.return_value = task_result
            return chain

        mock_table.select = mock_operations
        mock_table.insert = mock_operations

        response = client.post(
            f"/api/tasks/?plan_id={mock_plan_id}",
            json={"title": "New Task", "description": "Task description", "order": 2},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Task"

    def test_create_task_missing_title(self, client, mock_plan_id):
        """Test task creation with missing title"""
        response = client.post(
            f"/api/tasks/?plan_id={mock_plan_id}",
            json={"description": "Task description"},
        )

        assert response.status_code == 422


class TestUpdateTask:
    """Tests for task update endpoint"""

    @patch("api.routes.tasks.get_supabase_client")
    def test_update_task_status(
        self, mock_get_supabase, client, mock_task_id, sample_task_data
    ):
        """Test updating task status"""
        mock_supabase = Mock()
        mock_get_supabase.return_value = mock_supabase

        # Mock task ownership check
        task_check_result = Mock()
        task_check_result.data = [{"plan_id": "some-plan-id"}]

        # Mock plan ownership check
        plan_result = Mock()
        plan_result.data = [{"user_id": "6c631abd-435b-4c87-b5af-c2e01023c318"}]

        # Mock task update
        updated_task = sample_task_data.copy()
        updated_task["status"] = "completed"
        update_result = Mock()
        update_result.data = [updated_task]

        mock_table = Mock()
        mock_supabase.table.return_value = mock_table

        # Setup mock chains
        select_chain = Mock()
        select_chain.eq.return_value.execute.return_value = task_check_result
        mock_table.select.return_value = select_chain

        update_chain = Mock()
        update_chain.eq.return_value.execute.return_value = update_result
        mock_table.update.return_value = update_chain

        response = client.patch(
            f"/api/tasks/{mock_task_id}", json={"status": "completed"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "completed"

    @patch("api.routes.tasks.get_supabase_client")
    def test_update_task_no_fields(self, mock_get_supabase, client, mock_task_id):
        """Test update with no fields provided"""
        mock_supabase = Mock()
        mock_get_supabase.return_value = mock_supabase

        # Mock ownership checks
        task_check_result = Mock()
        task_check_result.data = [{"plan_id": "some-plan-id"}]
        plan_result = Mock()
        plan_result.data = [{"user_id": "6c631abd-435b-4c87-b5af-c2e01023c318"}]

        mock_table = Mock()
        mock_supabase.table.return_value = mock_table
        select_chain = Mock()
        select_chain.eq.return_value.execute.return_value = task_check_result
        mock_table.select.return_value = select_chain

        response = client.patch(f"/api/tasks/{mock_task_id}", json={})

        assert response.status_code == 400


class TestDeleteTask:
    """Tests for task deletion endpoint"""

    @patch("api.routes.tasks.get_supabase_client")
    def test_delete_task_success(self, mock_get_supabase, client, mock_task_id):
        """Test successful task deletion"""
        mock_supabase = Mock()
        mock_get_supabase.return_value = mock_supabase

        # Mock ownership checks
        task_check_result = Mock()
        task_check_result.data = [{"plan_id": "some-plan-id"}]
        plan_result = Mock()
        plan_result.data = [{"user_id": "6c631abd-435b-4c87-b5af-c2e01023c318"}]
        delete_result = Mock()
        delete_result.data = [{"id": mock_task_id}]

        mock_table = Mock()
        mock_supabase.table.return_value = mock_table

        select_chain = Mock()
        select_chain.eq.return_value.execute.return_value = task_check_result
        mock_table.select.return_value = select_chain

        delete_chain = Mock()
        delete_chain.eq.return_value.execute.return_value = delete_result
        mock_table.delete.return_value = delete_chain

        response = client.delete(f"/api/tasks/{mock_task_id}")

        assert response.status_code == 204


class TestReorderTasks:
    """Tests for task reordering endpoint"""

    @patch("api.routes.tasks.get_supabase_client")
    def test_reorder_tasks_success(self, mock_get_supabase, client, mock_task_id):
        """Test successful task reordering"""
        mock_supabase = Mock()
        mock_get_supabase.return_value = mock_supabase

        # Mock ownership checks
        task_check_result = Mock()
        task_check_result.data = [{"plan_id": "some-plan-id"}]
        plan_result = Mock()
        plan_result.data = [{"user_id": "6c631abd-435b-4c87-b5af-c2e01023c318"}]

        mock_table = Mock()
        mock_supabase.table.return_value = mock_table

        select_chain = Mock()
        select_chain.eq.return_value.execute.return_value = task_check_result
        mock_table.select.return_value = select_chain

        update_chain = Mock()
        update_chain.eq.return_value.execute.return_value = Mock(data=[{}])
        mock_table.update.return_value = update_chain

        response = client.post(
            "/api/tasks/reorder",
            json={
                "tasks": [
                    {"task_id": mock_task_id, "new_order": 0},
                    {"task_id": mock_task_id, "new_order": 1},
                ]
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert "message" in data
