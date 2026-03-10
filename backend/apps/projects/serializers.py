from rest_framework import serializers
from apps.projects.models import Project
from apps.users.serializers import UserSerializer


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for Project model with full details."""
    manager_detail = UserSerializer(source='manager', read_only=True)
    members_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'manager', 'manager_detail', 
            'status', 'start_date', 'end_date', 
            'members', 'members_count'
        ]
        read_only_fields = ['id', 'manager_detail', 'members_count']
    
    def get_members_count(self, obj):
        return obj.members.count()
    
    def validate_end_date(self, value):
        start_date = self.initial_data.get('start_date')
        if start_date and value and value < start_date:
            raise serializers.ValidationError("End date cannot be before start date.")
        return value


class ProjectListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing projects."""
    manager_name = serializers.CharField(source='manager.username', read_only=True)
    members_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = ['id', 'name', 'status', 'manager_name', 'members_count', 'start_date']
        read_only_fields = ['id']
    
    def get_members_count(self, obj):
        return obj.members.count()
