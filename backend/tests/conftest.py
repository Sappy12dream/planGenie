import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
from main import app
from datetime import datetime, date
import uuid


@pytest.fixture
def client():
    """FastAPI test client"""
    return TestClient(app)


@pytest.fixture
def mock_user_id():
    """Mock user ID for testing"""
    return "6c631abd-435b-4c87-b5af-c2e01023c318"


@pytest.fixture
def mock_plan_id():
    """Mock plan ID for testing"""
    return str(uuid.uuid4())


@pytest.fixture
def mock_task_id():
    """Mock task ID for testing"""
    return str(uuid.uuid4())


@pytest.fixture
def sample_plan_data(mock_user_id, mock_plan_id):
    """Sample plan data"""
    return {
        "id": mock_plan_id,
        "user_id": mock_user_id,
        "title": "Test Plan",
        "description": "Test Description",
        "status": "active",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }


@pytest.fixture
def sample_task_data(mock_plan_id, mock_task_id):
    """Sample task data"""
    return {
        "id": mock_task_id,
        "plan_id": mock_plan_id,
        "title": "Test Task",
        "description": "Test task description",
        "status": "pending",
        "due_date": None,
        "order": 0,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }


@pytest.fixture
def sample_resource_data(mock_plan_id):
    """Sample resource data"""
    return {
        "id": str(uuid.uuid4()),
        "plan_id": mock_plan_id,
        "title": "Test Resource",
        "url": "https://example.com",
        "type": "link",
        "created_at": datetime.now().isoformat(),
    }


@pytest.fixture
def mock_supabase_client():
    """Mock Supabase client"""
    mock_client = Mock()
    mock_table = Mock()
    mock_client.table.return_value = mock_table
    return mock_client, mock_table
