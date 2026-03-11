from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.employees.models import Employee
from apps.employees.serializers import EmployeeSerializer, EmployeeListSerializer
from apps.users.permissions import IsAdmin, IsManager


class EmployeeListView(generics.ListAPIView):
    """
    Get list of all employees.
    Accessible by all authenticated users.
    """
    serializer_class = EmployeeListSerializer
    permission_classes = [IsAuthenticated]
    queryset = Employee.objects.select_related('user', 'department').all()


class EmployeeCreateView(generics.CreateAPIView):
    """
    Create a new employee profile.
    Only admins and managers can create employee profiles.
    """
    serializer_class = EmployeeSerializer
    permission_classes = [IsManager]


class EmployeeDetailView(generics.RetrieveAPIView):
    """
    Get details of a specific employee.
    Accessible by all authenticated users.
    """
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]
    queryset = Employee.objects.select_related('user', 'department').all()


class EmployeeUpdateView(generics.UpdateAPIView):
    """
    Update an employee profile.
    Only admins and managers can update employee profiles.
    """
    serializer_class = EmployeeSerializer
    permission_classes = [IsManager]
    queryset = Employee.objects.all()


class EmployeeDeleteView(generics.DestroyAPIView):
    """
    Delete an employee profile.
    Only admins can delete employee profiles.
    """
    permission_classes = [IsAdmin]
    queryset = Employee.objects.all()


class MyProfileView(APIView):
    """
    Get current user's employee profile.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            employee = Employee.objects.select_related('user', 'department').get(user=request.user)
            serializer = EmployeeSerializer(employee)
            return Response(serializer.data)
        except Employee.DoesNotExist:
            return Response(
                {"error": "Employee profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

