from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Q

from apps.tasks.models import Task
from apps.projects.models import Project
from apps.users.models import User
from apps.notifications.models import Notification
from apps.activity_logs.models import ActivityLog


@shared_task
def generate_weekly_summary():
    """
    Generate weekly summary report for all managers.
    Runs every Monday at 8 AM.
    """
    week_ago = timezone.now() - timedelta(days=7)
    
    # Get statistics for the past week
    tasks_completed = Task.objects.filter(
        is_deleted=False,
        status='completed',
        updated_at__gte=week_ago
    ).count()
    
    tasks_created = Task.objects.filter(
        is_deleted=False,
        created_at__gte=week_ago
    ).count()
    
    projects_created = Project.objects.filter(
        created_at__gte=week_ago
    ).count()
    
    # Get most active users
    most_active_users = User.objects.annotate(
        completed_tasks=Count(
            'assigned_tasks',
            filter=Q(
                assigned_tasks__is_deleted=False,
                assigned_tasks__status='completed',
                assigned_tasks__updated_at__gte=week_ago
            )
        )
    ).filter(completed_tasks__gt=0).order_by('-completed_tasks')[:5]
    
    # Build summary message
    summary_lines = [
        "📊 Weekly Summary Report",
        f"Period: {week_ago.strftime('%Y-%m-%d')} to {timezone.now().strftime('%Y-%m-%d')}",
        "",
        f"✅ Tasks Completed: {tasks_completed}",
        f"📝 Tasks Created: {tasks_created}",
        f"🚀 Projects Created: {projects_created}",
        "",
        "🏆 Top Performers:",
    ]
    
    for i, user in enumerate(most_active_users, 1):
        summary_lines.append(f"{i}. {user.username}: {user.completed_tasks} tasks completed")
    
    summary_message = "\n".join(summary_lines)
    
    # Send notification to all managers and admins
    managers = User.objects.filter(role__in=['admin', 'manager'])
    notifications_created = 0
    
    for manager in managers:
        Notification.objects.create(
            user=manager,
            message=summary_message,
            type='reminder'
        )
        notifications_created += 1
    
    return f"Generated weekly summary, sent to {notifications_created} managers"


@shared_task
def generate_project_status_report(project_id):
    """
    Generate detailed status report for a specific project.
    Can be triggered manually or scheduled.
    """
    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return f"Project {project_id} not found"
    
    # Get project statistics
    total_tasks = project.tasks.filter(is_deleted=False).count()
    completed_tasks = project.tasks.filter(is_deleted=False, status='completed').count()
    in_progress_tasks = project.tasks.filter(is_deleted=False, status='in_progress').count()
    pending_tasks = project.tasks.filter(is_deleted=False, status='pending').count()
    
    completion_percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    # Build report message
    report_message = f"""
📋 Project Status Report: {project.name}

Status: {project.get_status_display()}
Progress: {completion_percentage:.1f}%

Tasks Breakdown:
✅ Completed: {completed_tasks}
🔄 In Progress: {in_progress_tasks}
⏳ Pending: {pending_tasks}
📊 Total: {total_tasks}

Manager: {project.manager.username}
Team Members: {project.members.count()}
"""
    
    # Send to project manager
    Notification.objects.create(
        user=project.manager,
        message=report_message,
        type='reminder'
    )
    
    return f"Generated status report for project '{project.name}'"


@shared_task
def archive_old_activity_logs():
    """
    Archive activity logs older than 90 days.
    This task would typically move them to cold storage or delete them.
    """
    ninety_days_ago = timezone.now() - timedelta(days=90)
    
    # For now, just count them (in production, you'd archive or delete)
    old_logs_count = ActivityLog.objects.filter(
        timestamp__lt=ninety_days_ago
    ).count()
    
    # In production, you might do:
    # ActivityLog.objects.filter(timestamp__lt=ninety_days_ago).delete()
    
    return f"Found {old_logs_count} activity logs older than 90 days (archival would happen here)"
