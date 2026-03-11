from django.urls import path

from apps.activity_logs import views

urlpatterns = [
    # Activity Log CRUD
    path('activity-logs/', views.ActivityLogListView.as_view(), name='activity-log-list'),
    path('activity-logs/create/', views.ActivityLogCreateView.as_view(), name='activity-log-create'),
    path('activity-logs/<int:pk>/', views.ActivityLogDetailView.as_view(), name='activity-log-detail'),
    path('activity-logs/<int:pk>/delete/', views.ActivityLogDeleteView.as_view(), name='activity-log-delete'),
    
    # My activity logs
    path('activity-logs/my-logs/', views.MyActivityLogsView.as_view(), name='my-activity-logs'),
    
    # Statistics
    path('activity-logs/stats/', views.ActivityLogStatsView.as_view(), name='activity-log-stats'),
]
