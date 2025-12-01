import pytest
from api.schemas.task_schemas import TaskCreateRequest, TaskUpdateRequest, TaskPriority

class TestTaskPrioritySchemas:
    """Tests for task priority schema validation"""

    def test_task_create_with_priority(self):
        """Test TaskCreateRequest accepts priority field"""
        task = TaskCreateRequest(
            title="Test Task",
            description="Test description",
            priority=TaskPriority.HIGH
        )
        assert task.priority == TaskPriority.HIGH
        assert task.title == "Test Task"

    def test_task_create_default_priority(self):
        """Test TaskCreateRequest defaults to medium priority"""
        task = TaskCreateRequest(
            title="Test Task",
            description="Test description"
        )
        assert task.priority == TaskPriority.MEDIUM

    def test_task_update_with_priority(self):
        """Test TaskUpdateRequest accepts priority field"""
        update = TaskUpdateRequest(priority=TaskPriority.LOW)
        assert update.priority == TaskPriority.LOW

    def test_task_priority_enum_values(self):
        """Test TaskPriority enum has expected values"""
        assert TaskPriority.HIGH == "high"
        assert TaskPriority.MEDIUM == "medium"
        assert TaskPriority.LOW == "low"

    def test_task_create_all_priorities(self):
        """Test creating tasks with all priority levels"""
        for priority in [TaskPriority.HIGH, TaskPriority.MEDIUM, TaskPriority.LOW]:
            task = TaskCreateRequest(
                title=f"Task with {priority} priority",
                priority=priority
            )
            assert task.priority == priority
