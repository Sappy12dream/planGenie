from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from services.notification_service import NotificationService
from services.alert_engine_service import AlertEngineService
from services.supabase_service import get_supabase_client
from datetime import datetime, timedelta
import asyncio

scheduler = AsyncIOScheduler()

async def check_task_reminders():
    """Daily check for tasks due soon"""
    print("Running daily task reminder check...")
    supabase = get_supabase_client()
    
    # Get users with reminders enabled
    users = supabase.table("user_preferences").select("user_id, reminder_time_hours").eq("task_reminders", True).execute()
    
    for user in users.data:
        user_id = user["user_id"]
        hours = user.get("reminder_time_hours", 24)
        
        # Calculate time window
        start_time = datetime.now() + timedelta(hours=hours)
        end_time = start_time + timedelta(hours=1) # 1 hour window
        
        # Find tasks due in this window
        tasks = (
            supabase.table("tasks")
            .select("*, plans(user_id, title)")
            .eq("plans.user_id", user_id)
            .gte("due_date", start_time.isoformat())
            .lt("due_date", end_time.isoformat())
            .neq("status", "completed")
            .execute()
        )
        
        # Get user email
        user_data = supabase.auth.admin.get_user_by_id(user_id)
        if user_data and user_data.user and user_data.user.email:
            for task in tasks.data:
                await NotificationService.send_task_reminder(
                    user_email=user_data.user.email,
                    task=task,
                    plan=task["plans"]
                )

async def generate_dashboard_alerts():
    """Hourly generation of dashboard alerts"""
    print("Generating dashboard alerts...")
    supabase = get_supabase_client()
    
    # Get all active users (simplified: just getting all users from preferences for now)
    users = supabase.table("user_preferences").select("user_id").execute()
    
    for user in users.data:
        alerts = AlertEngineService.generate_alerts_for_user(supabase, user["user_id"])
        AlertEngineService.save_alerts(supabase, alerts)

def start_scheduler():
    """Initialize and start the scheduler"""
    # Daily reminders at 9 AM
    scheduler.add_job(
        check_task_reminders,
        CronTrigger(hour=9, minute=0),
        id="daily_reminders",
        replace_existing=True
    )
    
    # Hourly alerts
    scheduler.add_job(
        generate_dashboard_alerts,
        CronTrigger(minute=0), # Top of every hour
        id="hourly_alerts",
        replace_existing=True
    )
    
    scheduler.start()
    print("Scheduler started successfully")

def shutdown_scheduler():
    """Shutdown the scheduler"""
    scheduler.shutdown()
