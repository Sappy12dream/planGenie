"""
Monitoring and Analytics Service
Provides centralized tracking for custom metrics, AI performance, and user engagement.
"""

import sentry_sdk
from datetime import datetime
from typing import Dict, Any, Optional
import time


class MonitoringService:
    """Service for tracking custom metrics and events"""

    @staticmethod
    def track_ai_generation(
        user_id: str,
        plan_title: str,
        success: bool,
        duration_ms: float,
        error: Optional[str] = None,
        task_count: Optional[int] = None,
        resource_count: Optional[int] = None,
    ):
        """
        Track AI plan generation attempts and outcomes
        
        Args:
            user_id: User who initiated the generation
            plan_title: Title of the plan being generated
            success: Whether generation succeeded
            duration_ms: Time taken in milliseconds
            error: Error message if failed
            task_count: Number of tasks generated (if successful)
            resource_count: Number of resources generated (if successful)
        """
        event_data = {
            "user_id": user_id,
            "plan_title": plan_title,
            "success": success,
            "duration_ms": duration_ms,
            "timestamp": datetime.utcnow().isoformat(),
        }

        if success:
            event_data["task_count"] = task_count
            event_data["resource_count"] = resource_count
        else:
            event_data["error"] = error

        # Send custom event to Sentry
        sentry_sdk.capture_message(
            f"AI Generation {'Success' if success else 'Failed'}: {plan_title}",
            level="info" if success else "error",
            extras=event_data,
        )

        # Set custom metric
        sentry_sdk.set_measurement("ai_generation_duration_ms", duration_ms)
        if task_count:
            sentry_sdk.set_measurement("tasks_generated", task_count)

    @staticmethod
    def track_plan_created(user_id: str, plan_id: str, plan_type: Optional[str] = None):
        """Track when a user creates a new plan"""
        sentry_sdk.capture_message(
            "Plan Created",
            level="info",
            extras={
                "user_id": user_id,
                "plan_id": plan_id,
                "plan_type": plan_type,
                "timestamp": datetime.utcnow().isoformat(),
            },
        )

    @staticmethod
    def track_plan_completed(user_id: str, plan_id: str, task_count: int, duration_days: Optional[int] = None):
        """Track when a user completes a plan"""
        sentry_sdk.capture_message(
            "Plan Completed",
            level="info",
            extras={
                "user_id": user_id,
                "plan_id": plan_id,
                "task_count": task_count,
                "duration_days": duration_days,
                "timestamp": datetime.utcnow().isoformat(),
            },
        )

    @staticmethod
    def track_task_completed(user_id: str, task_id: str, plan_id: str):
        """Track when a user completes a task"""
        sentry_sdk.capture_message(
            "Task Completed",
            level="info",
            extras={
                "user_id": user_id,
                "task_id": task_id,
                "plan_id": plan_id,
                "timestamp": datetime.utcnow().isoformat(),
            },
        )

    @staticmethod
    def track_file_upload(
        user_id: str,
        task_id: str,
        file_size_bytes: int,
        file_type: str,
        success: bool,
        error: Optional[str] = None,
    ):
        """Track file upload attempts"""
        sentry_sdk.capture_message(
            f"File Upload {'Success' if success else 'Failed'}",
            level="info" if success else "warning",
            extras={
                "user_id": user_id,
                "task_id": task_id,
                "file_size_bytes": file_size_bytes,
                "file_type": file_type,
                "success": success,
                "error": error,
                "timestamp": datetime.utcnow().isoformat(),
            },
        )

        if success:
            sentry_sdk.set_measurement("file_upload_size_bytes", file_size_bytes)

    @staticmethod
    def track_chat_message(user_id: str, plan_id: str, message_length: int):
        """Track AI chat usage"""
        sentry_sdk.capture_message(
            "Chat Message Sent",
            level="info",
            extras={
                "user_id": user_id,
                "plan_id": plan_id,
                "message_length": message_length,
                "timestamp": datetime.utcnow().isoformat(),
            },
        )

    @staticmethod
    def set_user_context(user_id: str, email: Optional[str] = None):
        """Set user context for all subsequent events"""
        sentry_sdk.set_user({
            "id": user_id,
            "email": email,
        })

    @staticmethod
    def add_breadcrumb(message: str, category: str, level: str = "info", data: Optional[Dict[str, Any]] = None):
        """Add a breadcrumb for debugging context"""
        sentry_sdk.add_breadcrumb(
            message=message,
            category=category,
            level=level,
            data=data or {},
        )

    @staticmethod
    def capture_exception(error: Exception, context: Optional[Dict[str, Any]] = None):
        """Capture an exception with optional context"""
        if context:
            sentry_sdk.set_context("error_context", context)
        sentry_sdk.capture_exception(error)


class PerformanceTimer:
    """Context manager for tracking operation duration"""

    def __init__(self, operation_name: str):
        self.operation_name = operation_name
        self.start_time = None
        self.duration_ms = None

    def __enter__(self):
        self.start_time = time.time()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.duration_ms = (time.time() - self.start_time) * 1000
        
        # Add breadcrumb for performance tracking
        MonitoringService.add_breadcrumb(
            message=f"{self.operation_name} completed in {self.duration_ms:.2f}ms",
            category="performance",
            level="info",
            data={"duration_ms": self.duration_ms},
        )

    def get_duration_ms(self) -> float:
        """Get the duration in milliseconds"""
        return self.duration_ms if self.duration_ms else 0
