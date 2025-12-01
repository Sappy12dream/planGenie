import os
import resend
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from jinja2 import Environment, FileSystemLoader, select_autoescape
from config import settings

# Initialize Resend
resend.api_key = os.getenv("RESEND_API_KEY")

# Initialize Jinja2 environment for email templates
template_env = Environment(
    loader=FileSystemLoader("services/email_templates"),
    autoescape=select_autoescape(["html", "xml"]),
)

class NotificationService:
    @staticmethod
    async def send_email(
        to_email: str,
        subject: str,
        template_name: str,
        context: Dict[str, Any]
    ) -> bool:
        """
        Send an email using Resend and Jinja2 templates
        """
        try:
            # Render template
            template = template_env.get_template(template_name)
            html_content = template.render(**context)

            # Send email
            params = {
                "from": "PlanGenie <notifications@plangenie.app>",
                "to": [to_email],
                "subject": subject,
                "html": html_content,
            }

            email = resend.Emails.send(params)
            print(f"Email sent successfully to {to_email}: {email}")
            return True

        except Exception as e:
            print(f"Failed to send email to {to_email}: {str(e)}")
            return False

    @staticmethod
    async def send_task_reminder(
        user_email: str,
        task: Dict[str, Any],
        plan: Dict[str, Any]
    ) -> bool:
        """Send a reminder for a specific task"""
        return await NotificationService.send_email(
            to_email=user_email,
            subject=f"Reminder: {task['title']} is due soon",
            template_name="task_reminder.html",
            context={
                "task": task,
                "plan": plan,
                "user_email": user_email,
                "action_url": f"{settings.frontend_url}/plans/{plan['id']}",
            }
        )

    @staticmethod
    async def send_weekly_digest(
        user_email: str,
        stats: Dict[str, Any],
        upcoming_tasks: List[Dict[str, Any]]
    ) -> bool:
        """Send weekly digest email"""
        return await NotificationService.send_email(
            to_email=user_email,
            subject="Your Weekly PlanGenie Digest",
            template_name="weekly_digest.html",
            context={
                "stats": stats,
                "upcoming_tasks": upcoming_tasks,
                "user_email": user_email,
                "dashboard_url": f"{settings.frontend_url}/dashboard",
            }
        )

    @staticmethod
    async def send_overdue_alert(
        user_email: str,
        overdue_tasks: List[Dict[str, Any]]
    ) -> bool:
        """Send alert for overdue tasks"""
        return await NotificationService.send_email(
            to_email=user_email,
            subject=f"Action Required: {len(overdue_tasks)} Overdue Tasks",
            template_name="overdue.html",
            context={
                "tasks": overdue_tasks,
                "user_email": user_email,
                "dashboard_url": f"{settings.frontend_url}/dashboard",
            }
        )
