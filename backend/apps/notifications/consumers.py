import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time notifications.
    Each user connects and joins their personal channel group: user_{user_id}
    """
    
    async def connect(self):
        """
        Handle WebSocket connection.
        Authenticate user and add to their personal group.
        """
        # Check if user is authenticated
        user = self.scope.get('user')
        
        if not user or not user.is_authenticated:
            await self.close()
            return
        
        # Create personal group name for this user
        self.user_id = user.id
        self.group_name = f'user_{self.user_id}'
        
        # Add this channel to the user's group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        # Accept the WebSocket connection
        await self.accept()
        
        # Send welcome message
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to notification service',
            'user_id': self.user_id
        }))
    
    async def disconnect(self, close_code):
        """
        Handle WebSocket disconnection.
        Remove channel from user's group.
        """
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        """
        Handle messages received from WebSocket (if needed).
        Currently just echoes back for testing.
        """
        try:
            data = json.loads(text_data)
            
            # Echo back for testing
            await self.send(text_data=json.dumps({
                'type': 'echo',
                'message': 'Message received',
                'data': data
            }))
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON'
            }))
    
    async def send_notification(self, event):
        """
        Handle notification messages sent to this user's group.
        This method is called when channel_layer.group_send() is used.
        """
        # Send notification to WebSocket
        await self.send(text_data=json.dumps({
            'type': event.get('notification_type', 'notification'),
            'message': event.get('message', ''),
            'data': event.get('data', {}),
            'timestamp': event.get('timestamp', ''),
        }))
    
    async def task_assigned(self, event):
        """
        Handle task_assigned event specifically.
        """
        await self.send(text_data=json.dumps({
            'type': 'task_assigned',
            'message': event['message'],
            'task_id': event.get('task_id'),
            'task_title': event.get('task_title'),
            'timestamp': event.get('timestamp'),
        }))
    
    async def deadline_reminder(self, event):
        """
        Handle deadline_reminder event specifically.
        """
        await self.send(text_data=json.dumps({
            'type': 'deadline_reminder',
            'message': event['message'],
            'task_id': event.get('task_id'),
            'deadline': event.get('deadline'),
            'timestamp': event.get('timestamp'),
        }))
