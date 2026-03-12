from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.notifications.models import Notification
from apps.notifications.serializers import NotificationSerializer, NotificationListSerializer
from apps.users.permissions import IsManager


class NotificationListView(generics.ListAPIView):
    """
    Get list of all notifications for the current user.
    Ordered by timestamp (newest first).
    """
    serializer_class = NotificationListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Users only see their own notifications
        return Notification.objects.filter(user=self.request.user).order_by('-timestamp')


class NotificationCreateView(generics.CreateAPIView):
    """
    Create a new notification.
    Only managers and admins can create notifications.
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsManager]
    
    # def perform_create(self, serializer):
    #     # The user field should be provided in the request data
    #     serializer.save()


class NotificationDetailView(generics.RetrieveAPIView):
    """
    Get details of a specific notification.
    Users can only view their own notifications.
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Users only see their own notifications
        return Notification.objects.filter(user=self.request.user)


class MarkAsReadView(APIView):
    """
    Mark a specific notification as read.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.is_read = True
            notification.save()
            serializer = NotificationSerializer(notification)
            return Response(serializer.data)
        except Notification.DoesNotExist:
            return Response(
                {"error": "Notification not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class MarkAllAsReadView(APIView):
    """
    Mark all notifications as read for the current user.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        updated_count = Notification.objects.filter(
            user=request.user, 
            is_read=False
        ).update(is_read=True)
        
        return Response({
            "message": f"{updated_count} notification(s) marked as read"
        })


class UnreadNotificationsView(APIView):
    """
    Get count of unread notifications for the current user.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        unread_count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()
        
        return Response({
            "unread_count": unread_count
        })


class DeleteNotificationView(generics.DestroyAPIView):
    """
    Delete a notification.
    Users can only delete their own notifications.
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
