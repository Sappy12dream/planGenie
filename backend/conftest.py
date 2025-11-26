"""
Pytest configuration and shared test fixtures for PlanGenie backend
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, MagicMock
from uuid import uuid4
import os

# Set dummy environment variables for testing
os.environ["SUPABASE_URL"] = "https://example.supabase.co"
os.environ["SUPABASE_SERVICE_ROLE_KEY"] = "dummy-key"
os.environ["OPENAI_API_KEY"] = "dummy-key"
os.environ["SENTRY_DSN"] = "https://dummy@sentry.io/123"

from main import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI app"""
    return TestClient(app)


@pytest.fixture
def mock_plan_id():
    """Generate a mock plan UUID"""
    return str(uuid4())


@pytest.fixture
def mock_task_id():
    """Generate a mock task UUID"""
    return str(uuid4())


@pytest.fixture
def mock_user_id():
    """Generate a mock user UUID"""
    return str(uuid4())


@pytest.fixture
def sample_plan_data(mock_plan_id, mock_user_id):
    """Sample plan data for testing"""
    return {
        "id": mock_plan_id,
        "user_id": mock_user_id,
        "title": "Test Plan",
        "description": "This is a test plan",
        "status": "active",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
    }


@pytest.fixture
def sample_task_data(mock_task_id, mock_plan_id):
    """Sample task data for testing"""
    return {
        "id": mock_task_id,
        "plan_id": mock_plan_id,
        "title": "Test Task",
        "description": "This is a test task",
        "status": "pending",
        "order": 1,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
    }


@pytest.fixture
def sample_resource_data(mock_plan_id):
    """Sample resource data for testing"""
    return {
        "id": str(uuid4()),
        "plan_id": mock_plan_id,
        "title": "Test Resource",
        "url": "https://example.com",
        "type": "link",
        "created_at": "2024-01-01T00:00:00Z",
    }


@pytest.fixture
def sample_ai_response():
    """Sample AI response for plan generation"""
    return {
        "title": "Learn Python Programming",
        "tasks": [
            {
                "title": "Set up Python development environment",
                "description": "Install Python 3.9+, VS Code, and essential extensions",
                "estimated_hours": 2,
                "difficulty": 1,
                "tools_needed": ["Python", "VS Code"],
                "order": 1
            },
            {
                "title": "Learn Python basics and syntax",
                "description": "Study variables, data types, loops, and functions",
                "estimated_hours": 10,
                "difficulty": 2,
                "tools_needed": ["Python"],
                "order": 2
            },
            {
                "title": "Build a simple project",
                "description": "Create a command-line calculator or to-do list app",
                "estimated_hours": 5,
                "difficulty": 3,
                "tools_needed": ["Python"],
                "order": 3
            }
        ],
        "resources": [
            {
                "title": "Python Official Documentation",
                "url": "https://docs.python.org/3/",
                "type": "link"
            },
            {
                "title": "Python Tutorial for Beginners",
                "url": "https://www.youtube.com/watch?v=example",
                "type": "video"
            }
        ],
        "metadata": {
            "total_estimated_hours": 17,
            "total_estimated_cost": 0,
            "health_score": 95,
            "difficulty_level": "beginner"
        }
    }


@pytest.fixture
def mock_supabase_client():
    """Create a mock Supabase client"""
    mock_client = MagicMock()
    
    # Mock table method to return a chainable mock
    mock_table = MagicMock()
    mock_client.table.return_value = mock_table
    
    return mock_client


@pytest.fixture
def mock_openai_response():
    """Create a mock OpenAI API response"""
    mock_response = Mock()
    mock_response.choices = [
        Mock(
            message=Mock(
                content='{"title": "Test Plan", "tasks": [], "resources": []}'
            )
        )
    ]
    return mock_response
