from rest_framework import serializers
from apps.tasks.models import Task, Comment
from apps.users.serializers import UserSerializer


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for Task model with full details."""
    assigned_to_detail = UserSerializer(source='assigned_to', read_only=True)
    created_by_detail = UserSerializer(source='created_by', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'parent_task', 'project', 'project_name', 'title', 
            'assigned_to', 'assigned_to_detail', 'created_by', 'created_by_detail',
            'status', 'priority', 'deadline', 'is_deleted', 'comments_count'
        ]
        read_only_fields = ['id', 'created_by', 'created_by_detail', 'assigned_to_detail', 'project_name', 'comments_count']
    
    def get_comments_count(self, obj):
        return obj.comments.count()


class TaskListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing tasks."""
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    
    class Meta:
        model = Task
        fields = ['id', 'title', 'project_name', 'assigned_to_name', 'status', 'priority', 'deadline']
        read_only_fields = ['id']


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for Comment model."""
    author_detail = UserSerializer(source='author', read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'task', 'author', 'author_detail', 'content', 'created_at']
        read_only_fields = ['id', 'author', 'author_detail', 'created_at']
