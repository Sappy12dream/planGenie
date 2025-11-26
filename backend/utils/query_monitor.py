"""
Query monitoring utility for tracking slow database queries
Integrates with Sentry for performance monitoring
"""

import time
import functools
from typing import Callable, Any
from services.monitoring_service import MonitoringService
import sentry_sdk


class QueryMonitor:
    """Monitor database query performance and log slow queries"""
    
    # Threshold for slow queries in milliseconds
    SLOW_QUERY_THRESHOLD_MS = 100
    
    @classmethod
    def track_query(cls, operation_name: str):
        """
        Decorator to track query execution time
        
        Usage:
            @QueryMonitor.track_query("get_plans")
            def get_plans(supabase, user_id):
                return supabase.table("plans").select("*").execute()
        """
        def decorator(func: Callable) -> Callable:
            @functools.wraps(func)
            def wrapper(*args, **kwargs) -> Any:
                start_time = time.time()
                
                # Start Sentry span for query tracking
                with sentry_sdk.start_span(op="db.query", description=operation_name) as span:
                    try:
                        result = func(*args, **kwargs)
                        
                        # Calculate duration
                        duration_ms = (time.time() - start_time) * 1000
                        
                        # Set span data
                        span.set_data("duration_ms", duration_ms)
                        span.set_data("query_name", operation_name)
                        
                        # Log slow queries
                        if duration_ms > cls.SLOW_QUERY_THRESHOLD_MS:
                            cls._log_slow_query(operation_name, duration_ms, args, kwargs)
                            span.set_tag("slow_query", True)
                        
                        return result
                        
                    except Exception as e:
                        # Track failed queries
                        duration_ms = (time.time() - start_time) * 1000
                        span.set_data("duration_ms", duration_ms)
                        span.set_data("error", str(e))
                        raise
                        
            return wrapper
        return decorator
    
    @classmethod
    def _log_slow_query(cls, operation: str, duration_ms: float, args: tuple, kwargs: dict):
        """Log slow query for monitoring"""
        print(f"⚠️  SLOW QUERY DETECTED: {operation}")
        print(f"   Duration: {duration_ms:.2f}ms (threshold: {cls.SLOW_QUERY_THRESHOLD_MS}ms)")
        
        # Send to Sentry
        MonitoringService.track_custom_metric(
            metric_name="slow_query",
            value=duration_ms,
            context={
                "operation": operation,
                "threshold_ms": cls.SLOW_QUERY_THRESHOLD_MS,
            }
        )
    
    @classmethod
    def set_threshold(cls, threshold_ms: int):
        """Set the slow query threshold in milliseconds"""
        cls.SLOW_QUERY_THRESHOLD_MS = threshold_ms


def track_supabase_query(operation_name: str):
    """
    Simplified decorator for Supabase queries
    
    Usage:
        @track_supabase_query("fetch_plan_with_tasks")
        def get_plan_data(supabase, plan_id):
            return supabase.table("plans").select("*, tasks(*)").eq("id", plan_id).execute()
    """
    return QueryMonitor.track_query(operation_name)
