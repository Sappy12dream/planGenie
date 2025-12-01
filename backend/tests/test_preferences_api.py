import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from main import app
from api.routes.preferences import get_supabase_client, get_user_from_token

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

def test_get_preferences_existing():
    # Setup
    mock_prefs = {
        "user_id": mock_user_id,
        "email_notifications": True,
        "task_reminders": False,
        "weekly_digest": True,
        "reminder_time_hours": 24,
        "digest_day_of_week": 0,
        "created_at": "2023-01-01T00:00:00",
        "updated_at": "2023-01-01T00:00:00"
    }
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [mock_prefs]
    
    # Execute
    response = client.get("/api/preferences/")
    
    # Verify
    assert response.status_code == 200
    assert response.json()["email_notifications"] is True
    assert response.json()["task_reminders"] is False

def test_update_preferences():
    # Setup
    update_data = {"email_notifications": False}
    mock_updated_prefs = {
        "user_id": mock_user_id,
        "email_notifications": False, # Updated
        "task_reminders": False,
        "weekly_digest": True,
        "reminder_time_hours": 24,
        "digest_day_of_week": 0,
        "created_at": "2023-01-01T00:00:00",
        "updated_at": "2023-01-02T00:00:00"
    }
    
    # Mock GET first (required by implementation)
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [mock_updated_prefs]
    # Mock UPDATE
    mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [mock_updated_prefs]
    
    # Execute
    response = client.patch("/api/preferences/", json=update_data)
    
    # Verify
    assert response.status_code == 200
    assert response.json()["email_notifications"] is False
