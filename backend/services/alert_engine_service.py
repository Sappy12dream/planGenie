from typing import List, Dict, Any
from datetime import datetime, timedelta
from supabase import Client

class AlertEngineService:
    @staticmethod
    def generate_alerts_for_user(supabase: Client, user_id: str) -> List[Dict[str, Any]]:
        """
        Generate smart alerts for a user based on their tasks and plans
        """
        alerts = []
        
        # Fetch active tasks
        tasks_result = (
            supabase.table("tasks")
            .select("*, plans(title)")
            .eq("plans.user_id", user_id)
            .neq("status", "completed")
            .execute()
        )
        tasks = tasks_result.data
        
        # 1. Quick Win Alerts
        # Tasks with low effort (< 1 hour) and high priority
        quick_wins = [
            t for t in tasks 
            if t.get("estimated_time_hours") and t["estimated_time_hours"] < 1.0 
            and t.get("priority") == "high"
        ]
        
        for task in quick_wins:
            alerts.append({
                "user_id": user_id,
                "type": "quick_win",
                "priority": 2, # Medium priority alert
                "task_id": task["id"],
                "plan_id": task["plan_id"],
                "title": "Quick Win Available",
                "message": f"'{task['title']}' is a high priority task that will take less than an hour.",
                "action_label": "Complete Now",
                "action_url": f"/plans/{task['plan_id']}",
            })
            
        # 2. Overdue Alerts
        # Tasks with due date in the past
        now = datetime.now().isoformat()
        overdue = [
            t for t in tasks
            if t.get("due_date") and t["due_date"] < now
        ]
        
        for task in overdue:
            alerts.append({
                "user_id": user_id,
                "type": "overdue_task",
                "priority": 1, # High priority alert
                "task_id": task["id"],
                "plan_id": task["plan_id"],
                "title": "Task Overdue",
                "message": f"'{task['title']}' was due on {task['due_date']}.",
                "action_label": "Reschedule",
                "action_url": f"/plans/{task['plan_id']}",
            })
            
        # 3. High Priority Due Soon
        # High priority tasks due in next 48 hours
        two_days_from_now = (datetime.now() + timedelta(days=2)).isoformat()
        due_soon = [
            t for t in tasks
            if t.get("priority") == "high" 
            and t.get("due_date") 
            and now < t["due_date"] < two_days_from_now
        ]
        
        for task in due_soon:
            alerts.append({
                "user_id": user_id,
                "type": "high_priority",
                "priority": 1,
                "task_id": task["id"],
                "plan_id": task["plan_id"],
                "title": "High Priority Due Soon",
                "message": f"'{task['title']}' is due soon. Don't miss it!",
                "action_label": "View Task",
                "action_url": f"/plans/{task['plan_id']}",
            })
            
        return alerts

    @staticmethod
    def save_alerts(supabase: Client, alerts: List[Dict[str, Any]]):
        """Save generated alerts to database, avoiding duplicates"""
        if not alerts:
            return
            
        # For each alert, check if similar active alert exists
        for alert in alerts:
            existing = (
                supabase.table("dashboard_alerts")
                .select("id")
                .eq("user_id", alert["user_id"])
                .eq("type", alert["type"])
                .eq("task_id", alert["task_id"])
                .is_("dismissed_at", "null")
                .execute()
            )
            
            if not existing.data:
                supabase.table("dashboard_alerts").insert(alert).execute()
