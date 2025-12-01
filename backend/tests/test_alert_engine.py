import pytest
from unittest.mock import MagicMock
from datetime import datetime, timedelta
from services.alert_engine_service import AlertEngineService

@pytest.fixture
def mock_supabase():
    mock = MagicMock()
    # Mock chainable query builder
    mock.table.return_value.select.return_value.eq.return_value.neq.return_value.execute.return_value.data = []
    return mock

def test_generate_quick_win_alerts(mock_supabase):
    # Setup
    user_id = "user123"
    tasks = [
        {
            "id": "t1", "plan_id": "p1", "title": "Quick Task", 
            "estimated_time_hours": 0.5, "priority": "high", "status": "todo",
            "plans": {"title": "Plan A"}
        },
        {
            "id": "t2", "plan_id": "p1", "title": "Long Task", 
            "estimated_time_hours": 2.0, "priority": "high", "status": "todo",
            "plans": {"title": "Plan A"}
        }
    ]
    
    # Mock supabase response
    mock_supabase.table.return_value.select.return_value.eq.return_value.neq.return_value.execute.return_value.data = tasks
    
    # Execute
    alerts = AlertEngineService.generate_alerts_for_user(mock_supabase, user_id)
    
    # Verify
    quick_win_alerts = [a for a in alerts if a["type"] == "quick_win"]
    assert len(quick_win_alerts) == 1
    assert quick_win_alerts[0]["task_id"] == "t1"
    assert quick_win_alerts[0]["title"] == "Quick Win Available"

def test_generate_overdue_alerts(mock_supabase):
    # Setup
    user_id = "user123"
    past_date = (datetime.now() - timedelta(days=1)).isoformat()
    future_date = (datetime.now() + timedelta(days=1)).isoformat()
    
    tasks = [
        {
            "id": "t1", "plan_id": "p1", "title": "Overdue Task", 
            "due_date": past_date, "status": "todo",
            "plans": {"title": "Plan A"}
        },
        {
            "id": "t2", "plan_id": "p1", "title": "Future Task", 
            "due_date": future_date, "status": "todo",
            "plans": {"title": "Plan A"}
        }
    ]
    
    # Mock supabase response
    mock_supabase.table.return_value.select.return_value.eq.return_value.neq.return_value.execute.return_value.data = tasks
    
    # Execute
    alerts = AlertEngineService.generate_alerts_for_user(mock_supabase, user_id)
    
    # Verify
    overdue_alerts = [a for a in alerts if a["type"] == "overdue_task"]
    assert len(overdue_alerts) == 1
    assert overdue_alerts[0]["task_id"] == "t1"
    assert overdue_alerts[0]["priority"] == 1 # High priority

def test_generate_high_priority_due_soon(mock_supabase):
    # Setup
    user_id = "user123"
    soon_date = (datetime.now() + timedelta(hours=24)).isoformat()
    
    tasks = [
        {
            "id": "t1", "plan_id": "p1", "title": "Important Task", 
            "due_date": soon_date, "priority": "high", "status": "todo",
            "plans": {"title": "Plan A"}
        }
    ]
    
    # Mock supabase response
    mock_supabase.table.return_value.select.return_value.eq.return_value.neq.return_value.execute.return_value.data = tasks
    
    # Execute
    alerts = AlertEngineService.generate_alerts_for_user(mock_supabase, user_id)
    
    # Verify
    priority_alerts = [a for a in alerts if a["type"] == "high_priority"]
    assert len(priority_alerts) == 1
    assert priority_alerts[0]["task_id"] == "t1"
