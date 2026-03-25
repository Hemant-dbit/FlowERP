from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from apps.tasks.models import Task
from apps.notifications.models import Notification


@shared_task
def check_approaching_deadlines():
    """
    Check for tasks with deadlines approaching in the next 24 hours.
    Send notifications to assigned users.
    """
    tomorrow = timezone.now() + timedelta(hours=24)
    today = timezone.now()
    
    # Find tasks with deadlines in the next 24 hours
    approaching_tasks = Task.objects.filter(
        is_deleted=False,
        deadline__gte=today,
        deadline__lte=tomorrow,
        status__in=['pending', 'in_progress']
    ).select_related('assigned_to', 'project')
    
    channel_layer = get_channel_layer()
    notifications_sent = 0
    
    for task in approaching_tasks:
        if task.assigned_to:
            # Create notification in database
            notification = Notification.objects.create(
                user=task.assigned_to,
                message=f"Reminder: Task '{task.title}' is due on {task.deadline.strftime('%Y-%m-%d %H:%M')}",
                type='deadline_overdue'
            )
            
            # Send real-time WebSocket notification
            try:
                async_to_sync(channel_layer.group_send)(
                    f"user_{task.assigned_to.id}",
                    {
                        'type': 'deadline_reminder',
                        'notification_id': notification.id,
                        'task_id': task.id,
                        'task_title': task.title,
                        'deadline': task.deadline.isoformat(),
                        'message': notification.message,
                    }
                )
                notifications_sent += 1
            except Exception as e:
                print(f"Failed to send WebSocket notification: {e}")
    
    return f"Sent {notifications_sent} deadline reminder notifications"


@shared_task
def send_overdue_task_reminders():
    """
    Check for overdue tasks and send reminders.
    Runs every 4 hours.
    """
    now = timezone.now()
    
    # Find overdue tasks
    overdue_tasks = Task.objects.filter(
        is_deleted=False,
        deadline__lt=now,
        status__in=['pending', 'in_progress']
    ).select_related('assigned_to', 'project')
    
    channel_layer = get_channel_layer()
    notifications_sent = 0
    
    for task in overdue_tasks:
        if task.assigned_to:
            # Create notification in database
            notification = Notification.objects.create(
                user=task.assigned_to,
                message=f"OVERDUE: Task '{task.title}' was due on {task.deadline.strftime('%Y-%m-%d')}",
                type='deadline_overdue'
            )
            
            # Send real-time WebSocket notification
            try:
                async_to_sync(channel_layer.group_send)(
                    f"user_{task.assigned_to.id}",
                    {
                        'type': 'deadline_reminder',
                        'notification_id': notification.id,
                        'task_id': task.id,
                        'task_title': task.title,
                        'overdue': True,
                        'deadline': task.deadline.isoformat(),
                        'message': notification.message,
                    }
                )
                notifications_sent += 1
            except Exception as e:
                print(f"Failed to send WebSocket notification: {e}")
    
    return f"Sent {notifications_sent} overdue task reminder notifications"


@shared_task
def cleanup_old_notifications():
    """
    Delete read notifications older than 30 days.
    Helps keep the database clean.
    """
    thirty_days_ago = timezone.now() - timedelta(days=30)
    
    deleted_count = Notification.objects.filter(
        is_read=True,
        timestamp__lt=thirty_days_ago
    ).delete()[0]
    
    return f"Deleted {deleted_count} old read notifications"
