from django.urls import path

from apps.notifications import views

urlpatterns = [
    # Notification CRUD
    path('notifications/', views.NotificationListView.as_view(), name='notification-list'),
    path('notifications/create/', views.NotificationCreateView.as_view(), name='notification-create'),
    path('notifications/<int:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    path('notifications/<int:pk>/delete/', views.DeleteNotificationView.as_view(), name='notification-delete'),
    
    # Notification actions
    path('notifications/<int:pk>/mark-read/', views.MarkAsReadView.as_view(), name='notification-mark-read'),
    path('notifications/mark-all-read/', views.MarkAllAsReadView.as_view(), name='notification-mark-all-read'),
    path('notifications/unread-count/', views.UnreadNotificationsView.as_view(), name='notification-unread-count'),
]
