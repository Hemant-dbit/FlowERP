from django.db.models.signals import m2m_changed
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils import timezone

from apps.projects.models import Project
from apps.notifications.models import Notification


@receiver(m2m_changed, sender=Project.members.through)
def notify_member_added_to_project(sender, instance, action, pk_set, **kwargs):
    """
    Send notification when a member is added to a project.
    Triggered when members are added via the M2M relationship.
    """
    if action == 'post_add' and pk_set:
        channel_layer = get_channel_layer()
        
        # For each newly added member, create a notification
        for user_id in pk_set:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            try:
                user = User.objects.get(id=user_id)
                
                # Create notification in database
                notification = Notification.objects.create(
                    user=user,
                    message=f'You have been added to project: {instance.name}',
                    type='task_assigned'
                )
                
                # Send real-time WebSocket notification
                if channel_layer:
                    try:
                        async_to_sync(channel_layer.group_send)(
                            f'user_{user.id}',
                            {
                                'type': 'task_assigned',
                                'message': f'You have been added to project: {instance.name}',
                                'project_id': instance.id,
                                'project_name': instance.name,
                                'timestamp': timezone.now().isoformat(),
                            }
                        )
                    except Exception as e:
                        # Log but don't fail - Redis/WebSocket is non-critical
                        import logging
                        logger = logging.getLogger('projects.signals')
                        logger.warning(f'Failed to send WebSocket notification: {str(e)}')
            except User.DoesNotExist:
                pass
