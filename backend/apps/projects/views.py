from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from apps.projects.models import Project
from apps.projects.serializers import ProjectSerializer, ProjectListSerializer
from apps.users.permissions import IsManager, CanManageProject


class ProjectListView(generics.ListAPIView):
    """
    Get list of projects.
    Filters based on user role.
    """
    serializer_class = ProjectListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return Project.objects.all()
        elif user.role == 'manager':
            return Project.objects.filter(manager=user)
        else:
            return Project.objects.filter(members=user)


class ProjectCreateView(generics.CreateAPIView):
    """
    Create a new project.
    Only managers and admins can create projects.
    """
    serializer_class = ProjectSerializer
    permission_classes = [IsManager]
    
    def perform_create(self, serializer):
        serializer.save(manager=self.request.user)


class ProjectDetailView(generics.RetrieveAPIView):
    """
    Get details of a specific project.
    """
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, CanManageProject]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return Project.objects.all()
        elif user.role == 'manager':
            return Project.objects.filter(manager=user)
        else:
            return Project.objects.filter(members=user)


class ProjectUpdateView(generics.UpdateAPIView):
    """
    Update a project.
    Only project manager or admin can update.
    """
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, CanManageProject]
    queryset = Project.objects.all()


class ProjectDeleteView(generics.DestroyAPIView):
    """
    Delete a project.
    Only project manager or admin can delete.
    """
    permission_classes = [IsAuthenticated, CanManageProject]
    queryset = Project.objects.all()


class AddMemberView(APIView):
    """
    Add a team member to project.
    Only project manager or admin can add members.
    """
    permission_classes = [IsAuthenticated, CanManageProject]
    
    def post(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
            self.check_object_permissions(request, project)
            
            user_id = request.data.get('user_id')
            if not user_id:
                return Response(
                    {"error": "user_id is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            from apps.users.models import User
            user = User.objects.get(id=user_id)
            project.members.add(user)
            
            return Response(
                {"message": f"User {user.username} added to project"},
                status=status.HTTP_200_OK
            )
        
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class RemoveMemberView(APIView):
    """
    Remove a team member from project.
    Only project manager or admin can remove members.
    """
    permission_classes = [IsAuthenticated, CanManageProject]
    
    def post(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
            self.check_object_permissions(request, project)
            
            user_id = request.data.get('user_id')
            if not user_id:
                return Response(
                    {"error": "user_id is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            from apps.users.models import User
            user = User.objects.get(id=user_id)
            project.members.remove(user)
            
            return Response(
                {"message": f"User {user.username} removed from project"},
                status=status.HTTP_200_OK
            )
        
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class MyProjectsView(generics.ListAPIView):
    """
    Get current user's projects.
    Returns projects where user is manager or member.
    """
    serializer_class = ProjectListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(
            Q(manager=user) | Q(members=user)
        ).distinct()
