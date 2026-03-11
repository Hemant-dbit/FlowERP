from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.contenttypes.models import ContentType

from apps.activity_logs.models import ActivityLog
from apps.activity_logs.serializers import ActivityLogSerializer, ActivityLogListSerializer
from apps.users.permissions import IsAdmin


class ActivityLogListView(generics.ListAPIView):
    """
    Get list of activity logs with filtering.
    Admins see all logs, others see only their own actions.
    
    Query Parameters:
    - user: Filter by user ID
    - action: Filter by action type
    - content_type: Filter by content type (model name)
    - start_date: Filter by date range (YYYY-MM-DD)
    - end_date: Filter by date range (YYYY-MM-DD)
    """
    serializer_class = ActivityLogListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = ActivityLog.objects.select_related(
            'user', 
            'content_type'
        ).all()
        
        # Role-based filtering
        if user.role != 'admin':
            # Non-admins only see their own activity logs
            queryset = queryset.filter(user=user)
        
        # Filter by user (admin only)
        user_id = self.request.query_params.get('user')
        if user_id and user.role == 'admin':
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by action
        action = self.request.query_params.get('action')
        if action:
            queryset = queryset.filter(action__icontains=action)
        
        # Filter by content type
        content_type = self.request.query_params.get('content_type')
        if content_type:
            try:
                ct = ContentType.objects.get(model=content_type.lower())
                queryset = queryset.filter(content_type=ct)
            except ContentType.DoesNotExist:
                pass
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        
        end_date = self.request.query_params.get('end_date')
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        
        return queryset.order_by('-timestamp')


class ActivityLogCreateView(generics.CreateAPIView):
    """
    Create a new activity log entry.
    Typically used for manual logging or testing.
    """
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        # Automatically set the user to the current user
        serializer.save(user=self.request.user)


class ActivityLogDetailView(generics.RetrieveAPIView):
    """
    Get details of a specific activity log.
    Admins see all logs, others see only their own.
    """
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = ActivityLog.objects.select_related('user', 'content_type').all()
        
        if user.role != 'admin':
            # Non-admins only see their own logs
            queryset = queryset.filter(user=user)
        
        return queryset


class MyActivityLogsView(generics.ListAPIView):
    """
    Get activity logs for the current user only.
    Convenient endpoint for "my activity" views.
    """
    serializer_class = ActivityLogListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ActivityLog.objects.filter(
            user=self.request.user
        ).select_related('user', 'content_type').order_by('-timestamp')


class ActivityLogDeleteView(generics.DestroyAPIView):
    """
    Delete an activity log.
    Only admins can delete activity logs.
    """
    permission_classes = [IsAdmin]
    queryset = ActivityLog.objects.all()


class ActivityLogStatsView(APIView):
    """
    Get activity statistics.
    Admins see all stats, others see their own.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        if user.role == 'admin':
            queryset = ActivityLog.objects.all()
        else:
            queryset = ActivityLog.objects.filter(user=user)
        
        total_logs = queryset.count()
        
        # Count by action type
        action_counts = {}
        for log in queryset.values('action').distinct():
            action = log['action']
            count = queryset.filter(action=action).count()
            action_counts[action] = count
        
        # Count by content type
        content_type_counts = {}
        for log in queryset.values('content_type').distinct():
            ct_id = log['content_type']
            try:
                ct = ContentType.objects.get(id=ct_id)
                count = queryset.filter(content_type=ct).count()
                content_type_counts[ct.model] = count
            except ContentType.DoesNotExist:
                pass
        
        return Response({
            'total_logs': total_logs,
            'action_counts': action_counts,
            'content_type_counts': content_type_counts,
        })

