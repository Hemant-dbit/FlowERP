from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils import timezone

from apps.tasks.models import Task
from apps.notifications.models import Notification


@receiver(pre_save, sender=Task)
def capture_old_assigned_to(sender, instance, **kwargs):
    """
    Capture the old assigned_to value BEFORE the save.
    Store it on the instance so we can check for changes in post_save.
    """
    if instance.pk:
        try:
            old_instance = Task.objects.get(pk=instance.pk)
            instance._old_assigned_to = old_instance.assigned_to
        except Task.DoesNotExist:
            instance._old_assigned_to = None
    else:
        instance._old_assigned_to = None


@receiver(post_save, sender=Task)
def notify_task_assigned(sender, instance, created, **kwargs):
    """
    Send real-time notification when a task is created or assigned.
    Creates a Notification record AND pushes it via WebSocket.
    """
    channel_layer = get_channel_layer()
    
    if created and instance.assigned_to:
        # Create notification in database
        notification = Notification.objects.create(
            user=instance.assigned_to,
            message=f'You have been assigned a new task: {instance.title}',
            type='task_assigned'
        )
        
        # Send real-time WebSocket notification
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f'user_{instance.assigned_to.id}',
                {
                    'type': 'task_assigned',
                    'message': f'You have been assigned: {instance.title}',
                    'task_id': instance.id,
                    'task_title': instance.title,
                    'timestamp': timezone.now().isoformat(),
                }
            )
    
    # If task is reassigned to a different user
    elif not created and instance.assigned_to:
        old_assigned_to = getattr(instance, '_old_assigned_to', None)
        
        # Check if assigned_to actually changed
        if old_assigned_to != instance.assigned_to:
            # Create notification
            notification = Notification.objects.create(
                user=instance.assigned_to,
                message=f'You have been assigned task: {instance.title}',
                type='task_assigned'
            )
            
            # Send WebSocket notification
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    f'user_{instance.assigned_to.id}',
                    {
                        'type': 'task_assigned',
                        'message': f'Task reassigned to you: {instance.title}',
                        'task_id': instance.id,
                        'task_title': instance.title,
                        'timestamp': timezone.now().isoformat(),
                    }
                )


@receiver(post_save, sender=Task)
def notify_deadline_approaching(sender, instance, created, **kwargs):
    """
    Send notification when deadline is approaching (within 24 hours).
    This would typically be triggered by a Celery periodic task,
    but we can also check on save.
    """
    if not created and instance.assigned_to and instance.deadline:
        time_until_deadline = instance.deadline - timezone.now()
        
        # If deadline is within 24 hours and task is not completed
        if 0 < time_until_deadline.total_seconds() < 86400:  # 24 hours
            if instance.status not in ['completed', 'on_hold']:
                channel_layer = get_channel_layer()
                
                # Create notification
                notification = Notification.objects.create(
                    user=instance.assigned_to,
                    message=f'Deadline approaching for task: {instance.title}',
                    type='deadline_overdue'
                )
                
                # Send WebSocket notification
                if channel_layer:
                    async_to_sync(channel_layer.group_send)(
                        f'user_{instance.assigned_to.id}',
                        {
                            'type': 'deadline_reminder',
                            'message': f'Deadline approaching: {instance.title}',
                            'task_id': instance.id,
                            'deadline': instance.deadline.isoformat(),
                            'timestamp': timezone.now().isoformat(),
                        }
                    )
