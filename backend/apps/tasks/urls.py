from django.urls import path
from apps.tasks import views

urlpatterns = [
    path('tasks/', views.TaskListView.as_view(), name='task_list'),
    path('tasks/create/', views.TaskCreateView.as_view(), name='task_create'),
    path('tasks/<int:pk>/', views.TaskDetailView.as_view(), name='task_detail'),
    path('tasks/<int:pk>/update/', views.TaskUpdateView.as_view(), name='task_update'),
    path('tasks/<int:pk>/delete/', views.TaskDeleteView.as_view(), name='task_delete'),
    path('tasks/my-tasks/', views.MyTasksView.as_view(), name='my_tasks'),
    path('tasks/<int:task_id>/comments/', views.CommentListView.as_view(), name='comment_list'),
    path('tasks/<int:task_id>/comments/create/', views.CommentCreateView.as_view(), name='comment_create'),
]
