from django.urls import path
from apps.projects import views

urlpatterns = [
    path('projects/', views.ProjectListView.as_view(), name='project_list'),
    path('projects/create/', views.ProjectCreateView.as_view(), name='project_create'),
    path('projects/<int:pk>/', views.ProjectDetailView.as_view(), name='project_detail'),
    path('projects/<int:pk>/update/', views.ProjectUpdateView.as_view(), name='project_update'),
    path('projects/<int:pk>/delete/', views.ProjectDeleteView.as_view(), name='project_delete'),
    path('projects/<int:pk>/add-member/', views.AddMemberView.as_view(), name='project_add_member'),
    path('projects/<int:pk>/remove-member/', views.RemoveMemberView.as_view(), name='project_remove_member'),
    path('projects/my-projects/', views.MyProjectsView.as_view(), name='my_projects'),
]
