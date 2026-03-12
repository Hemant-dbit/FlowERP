from rest_framework import serializers

from apps.notifications.models import Notification
from apps.users.serializers import UserSerializer


class NotificationSerializer(serializers.ModelSerializer):
    """
    Full notification serializer with user details.
    """
    user_detail = UserSerializer(source='user', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'user',
            'user_detail',
            'message',
            'type',
            'type_display',
            'is_read',
            'timestamp',
        ]
        read_only_fields = ['id', 'user_detail', 'type_display', 'timestamp']


class NotificationListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing notifications.
    """
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'message',
            'type',
            'type_display',
            'is_read',
            'timestamp',
        ]
        read_only_fields = ['id', 'type_display', 'timestamp']
