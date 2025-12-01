import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from main import app
from api.routes.alerts import get_supabase_client, get_user_from_token

client = TestClient(app)

# Mock dependencies
mock_supabase = MagicMock()
mock_user_id = "123e4567-e89b-12d3-a456-426614174000"

def override_get_supabase():
    return mock_supabase

def override_get_user():
    return mock_user_id

app.dependency_overrides[get_supabase_client] = override_get_supabase
app.dependency_overrides[get_user_from_token] = override_get_user

def test_get_active_alerts():
    # Setup
    mock_alerts = [
        {
            "id": "123e4567-e89b-12d3-a456-426614174001",
            "user_id": mock_user_id,
            "type": "quick_win",
            "priority": 2,
            "title": "Quick Win",
            "message": "Do this now",
            "created_at": "2023-01-01T00:00:00",
            "dismissed_at": None
        }
    ]
    # Mock chain: table -> select -> eq -> is_ -> order -> order -> execute
    mock_supabase.table.return_value.select.return_value.eq.return_value.is_.return_value.order.return_value.order.return_value.execute.return_value.data = mock_alerts
    
    # Execute
    response = client.get("/api/alerts/")
    
    # Verify
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["id"] == "123e4567-e89b-12d3-a456-426614174001"

def test_dismiss_alert():
    # Setup
    alert_id = "123e4567-e89b-12d3-a456-426614174001"
    
    # Mock verify ownership
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [{"user_id": mock_user_id}]
    
    # Mock update
    mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [{"id": alert_id}]
    
    # Execute
    response = client.patch(f"/api/alerts/{alert_id}/dismiss")
    
    # Verify
    assert response.status_code == 204
