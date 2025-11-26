from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
from main import app
from services.supabase_service import get_supabase_client
import pytest

client = TestClient(app)

@pytest.fixture
def mock_supabase():
    mock_client = Mock()
    app.dependency_overrides[get_supabase_client] = lambda: mock_client
    yield mock_client
    app.dependency_overrides = {}

@pytest.fixture
def mock_openai():
    with patch("services.template_service.client") as mock:
        yield mock

def test_get_templates(mock_supabase, mock_openai):
    # Mock Supabase response
    mock_db = Mock()
    mock_supabase.table.return_value = mock_db
    mock_db.select.return_value.eq.return_value.limit.return_value.execute.return_value.data = [
        {"title": "Plan 1", "description": "Desc 1", "total_estimated_hours": 10}
    ]
    
    # Mock OpenAI response
    mock_openai.chat.completions.create.return_value.choices = [
        Mock(message=Mock(content='{"templates": [{"id": "gen-1", "title": "Gen 1", "description": "Gen Desc", "timeline": "1 week", "category": "Other", "icon": "Star"}]}'))
    ]

    response = client.get("/api/templates")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 5 # 5 static + 1 generated
    
    # Check for generated template
    gen_ids = [t["id"] for t in data if t["id"].startswith("generated-")]
    assert len(gen_ids) > 0

def test_get_template_by_id():
    # Get first template ID
    # We can't rely on generated ones being there without mocking in this specific test or using the cache
    # So we test a static one
    first_id = "learn-language"
    
    # Fetch specific template
    response = client.get(f"/api/templates/{first_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == first_id

def test_get_nonexistent_template():
    response = client.get("/api/templates/nonexistent-id-123")
    assert response.status_code == 404
