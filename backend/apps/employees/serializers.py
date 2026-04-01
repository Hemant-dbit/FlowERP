from rest_framework import serializers
from apps.employees.models import Employee
from apps.users.serializers import UserSerializer, DepartmentSerializer


class EmployeeSerializer(serializers.ModelSerializer):
    """Serializer for Employee model with full details."""
    user_detail = UserSerializer(source='user', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    department_detail = DepartmentSerializer(source='department', read_only=True)
    
    class Meta:
        model = Employee
        fields = ['id', 'user_id', 'user', 'user_detail', 'position', 'joining_date', 'department', 'department_detail']
        read_only_fields = ['id', 'user_id', 'user_detail', 'department_detail']


class EmployeeListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing employees."""
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = Employee
        fields = ['id', 'user_id', 'username', 'email', 'position', 'joining_date', 'department_name']
        read_only_fields = ['id', 'user_id']
