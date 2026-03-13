from django.urls import path

from apps.reports import views

urlpatterns = [
    # Dashboard overview
    path('reports/overview/', views.OverviewReportView.as_view(), name='report-overview'),
    
    # Specific reports
    path('reports/tasks-by-status/', views.TasksByStatusReportView.as_view(), name='report-tasks-by-status'),
    path('reports/employee-workload/', views.EmployeeWorkloadReportView.as_view(), name='report-employee-workload'),
    path('reports/project-progress/', views.ProjectProgressReportView.as_view(), name='report-project-progress'),
    path('reports/weekly-completions/', views.WeeklyCompletionsReportView.as_view(), name='report-weekly-completions'),
    path('reports/department-summary/', views.DepartmentSummaryReportView.as_view(), name='report-department-summary'),
    
    # Personal dashboard
    path('dashboard/me/', views.MyDashboardView.as_view(), name='my-dashboard'),
]
