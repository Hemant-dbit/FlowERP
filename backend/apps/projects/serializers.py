from rest_framework import serializers
from apps.projects.models import Project
from apps.users.serializers import UserSerializer


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for Project model with full details."""
    manager_detail = UserSerializer(source='manager', read_only=True)
    members_count = serializers.SerializerMethodField()
    members = serializers.PrimaryKeyRelatedField(
        queryset=__import__('django.contrib.auth', fromlist=['get_user_model']).get_user_model().objects.all(),
        many=True,
        required=False,
        allow_empty=True
    )
    
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
    
    def validate(self, attrs):
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')

        # Compare parsed date objects (not raw request strings) to avoid TypeError.
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({"end_date": "End date cannot be before start date."})

        return attrs


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
