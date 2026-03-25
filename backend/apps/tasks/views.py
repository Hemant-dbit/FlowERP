from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from apps.tasks.models import Task, Comment
from apps.tasks.serializers import TaskSerializer, TaskListSerializer, CommentSerializer
from apps.users.permissions import CanManageTask


class TaskListView(generics.ListAPIView):
    """
    Get list of tasks.
    Filters based on user role.
    """
    serializer_class = TaskListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return Task.objects.filter(is_deleted=False)
        elif user.role == 'manager':
            return Task.objects.filter(
                Q(project__manager=user) | Q(assigned_to=user) | Q(created_by=user),
                is_deleted=False
            ).distinct()
        else:
            return Task.objects.filter(
                Q(assigned_to=user) | Q(created_by=user),
                is_deleted=False
            ).distinct()


class TaskCreateView(generics.CreateAPIView):
    """
    Create a new task.
    Any authenticated user can create tasks.
    """
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class TaskDetailView(generics.RetrieveAPIView):
    """
    Get details of a specific task.
    """
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return Task.objects.filter(is_deleted=False)
        elif user.role == 'manager':
            return Task.objects.filter(
                Q(project__manager=user) | Q(assigned_to=user) | Q(created_by=user),
                is_deleted=False
            ).distinct()
        else:
            return Task.objects.filter(
                Q(assigned_to=user) | Q(created_by=user),
                is_deleted=False
            ).distinct()


class TaskUpdateView(generics.UpdateAPIView):
    """
    Update a task.
    Only task creator, assignee, project manager, or admin can update.
    """
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, CanManageTask]
    queryset = Task.objects.filter(is_deleted=False)


class TaskDeleteView(APIView):
    """
    Soft delete a task.
    Only task creator, project manager, or admin can delete.
    """
    permission_classes = [IsAuthenticated, CanManageTask]
    
    def delete(self, request, pk):
        try:
            task = Task.objects.get(pk=pk, is_deleted=False)
            self.check_object_permissions(request, task)
            
            task.is_deleted = True
            task.save()
            
            return Response(
                {"message": "Task deleted successfully"},
                status=status.HTTP_200_OK
            )
        except Task.DoesNotExist:
            return Response(
                {"error": "Task not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class MyTasksView(generics.ListAPIView):
    """
    Get current user's tasks.
    Returns tasks assigned to or created by the user.
    """
    serializer_class = TaskListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(
            Q(assigned_to=user) | Q(created_by=user),
            is_deleted=False
        ).distinct()


class CommentListView(generics.ListAPIView):
    """
    Get all comments for a specific task.
    """
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        task_id = self.kwargs.get('task_id')
        return Comment.objects.filter(task_id=task_id).order_by('created_at')


class CommentCreateView(generics.CreateAPIView):
    """
    Add a comment to a task.
    """
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

