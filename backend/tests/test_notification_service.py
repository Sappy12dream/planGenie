import pytest
from unittest.mock import patch, MagicMock
from services.notification_service import NotificationService

@pytest.fixture
def mock_resend():
    with patch('services.notification_service.resend') as mock:
        yield mock

@pytest.mark.asyncio
async def test_send_task_reminder(mock_resend):
    # Setup
    user_email = "test@example.com"
    task = {"title": "Test Task", "due_date": "2023-12-31T12:00:00", "priority": "high"}
    plan = {"id": "plan123", "title": "Test Plan"}
    
    # Execute
    await NotificationService.send_task_reminder(user_email, task, plan)
    
    # Verify
    mock_resend.Emails.send.assert_called_once()
    call_args = mock_resend.Emails.send.call_args[0][0]
    assert call_args["to"] == user_email
    assert "Test Task" in call_args["subject"]
    assert "Test Plan" in call_args["html"]

@pytest.mark.asyncio
async def test_send_weekly_digest(mock_resend):
    # Setup
    user_email = "test@example.com"
    stats = {"completed_tasks": 5, "active_plans": 2, "completion_rate": 80}
    upcoming_tasks = [{"title": "Future Task", "due_date": "2024-01-01"}]
    
    # Execute
    await NotificationService.send_weekly_digest(user_email, stats, upcoming_tasks)
    
    # Verify
    mock_resend.Emails.send.assert_called_once()
    call_args = mock_resend.Emails.send.call_args[0][0]
    assert call_args["to"] == user_email
    assert "Weekly Digest" in call_args["subject"]
    # Template renders "80%" for completion rate
    assert "80%" in call_args["html"]
    assert "Future Task" in call_args["html"]

@pytest.mark.asyncio
async def test_send_overdue_alert(mock_resend):
    # Setup
    user_email = "test@example.com"
    tasks = [
        {"title": "Overdue 1", "due_date": "2023-01-01", "plans": {"title": "Plan A"}},
        {"title": "Overdue 2", "due_date": "2023-01-02", "plans": {"title": "Plan B"}}
    ]
    
    # Execute
    await NotificationService.send_overdue_alert(user_email, tasks)
    
    # Verify
    mock_resend.Emails.send.assert_called_once()
    call_args = mock_resend.Emails.send.call_args[0][0]
    assert call_args["to"] == user_email
    assert "2 Overdue Tasks" in call_args["subject"]
    assert "Overdue 1" in call_args["html"]
    assert "Overdue 2" in call_args["html"]
