from rest_framework import serializers

from apps.activity_logs.models import ActivityLog
from apps.users.serializers import UserSerializer


class ActivityLogSerializer(serializers.ModelSerializer):
    """
    Full activity log serializer with user details.
    """
    user_detail = UserSerializer(source='user', read_only=True)
    content_type_name = serializers.SerializerMethodField()
    target_repr = serializers.SerializerMethodField()
    
    class Meta:
        model = ActivityLog
        fields = [
            'id',
            'user',
            'user_detail',
            'action',
            'content_type',
            'content_type_name',
            'object_id',
            'target_repr',
            'timestamp',
        ]
        read_only_fields = [
            'id',
            'user_detail',
            'content_type_name',
            'target_repr',
            'timestamp'
        ]
    
    def get_content_type_name(self, obj):
        """Get the model name from content type."""
        return obj.content_type.model if obj.content_type else None
    
    def get_target_repr(self, obj):
        """Get string representation of the target object."""
        try:
            if obj.target_object:
                return str(obj.target_object)
            return f"{obj.content_type.model} (id={obj.object_id})"
        except Exception:
            return f"{obj.content_type.model} (id={obj.object_id})"


class ActivityLogListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing activity logs.
    """
    username = serializers.CharField(source='user.username', read_only=True)
    content_type_name = serializers.CharField(source='content_type.model', read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = [
            'id',
            'username',
            'action',
            'content_type_name',
            'object_id',
            'timestamp',
        ]
        read_only_fields = fields
