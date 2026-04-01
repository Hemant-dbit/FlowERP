from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q, Case, When, IntegerField, F
from django.db.models.functions import TruncDay
from django.utils import timezone
from datetime import timedelta

from apps.users.models import User, Department
from apps.projects.models import Project
from apps.tasks.models import Task
from apps.employees.models import Employee
from apps.users.permissions import IsManager


def _has_task_field(field_name):
    return any(field.name == field_name for field in Task._meta.get_fields())


class OverviewReportView(APIView):
    """
    Get high-level overview statistics.
    Returns: total users, projects, tasks, overdue tasks
    """
    permission_classes = [IsManager]
    
    def get(self, request):
        total_users = User.objects.count()
        total_projects = Project.objects.count()
        total_tasks = Task.objects.filter(is_deleted=False).count()
        
        # Count overdue tasks (deadline passed and not completed)
        overdue_tasks = Task.objects.filter(
            is_deleted=False,
            deadline__lt=timezone.now(),
        ).exclude(status='completed').count()
        
        # Active projects (not completed/on_hold)
        active_projects = Project.objects.filter(
            status='active'
        ).count()
        
        # Completed tasks this month
        month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if _has_task_field('updated_at'):
            completed_this_month = Task.objects.filter(
                is_deleted=False,
                status='completed',
                updated_at__gte=month_start
            ).count()
        else:
            # Fallback for schemas without timestamp fields.
            completed_this_month = Task.objects.filter(
                is_deleted=False,
                status='completed'
            ).count()
        
        return Response({
            'total_users': total_users,
            'total_projects': total_projects,
            'total_tasks': total_tasks,
            'overdue_tasks': overdue_tasks,
            'active_projects': active_projects,
            'completed_this_month': completed_this_month,
        })


class TasksByStatusReportView(APIView):
    """
    Get task count grouped by status.
    Uses values() + annotate(Count) aggregation.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Group tasks by status and count
        status_counts = Task.objects.filter(
            is_deleted=False
        ).values('status').annotate(
            count=Count('id')
        ).order_by('status')
        
        # Convert to dict for easier consumption
        result = {item['status']: item['count'] for item in status_counts}
        
        # Ensure all statuses are present (even with 0 count)
        all_statuses = ['pending', 'in_progress', 'completed', 'blocked']
        for status in all_statuses:
            if status not in result:
                result[status] = 0
        
        return Response(result)


class EmployeeWorkloadReportView(APIView):
    """
    Get tasks per employee, sorted by workload.
    Uses annotate + order_by.
    """
    permission_classes = [IsManager]
    
    def get(self, request):
        # Count tasks assigned to each user (excluding deleted and completed)
        workload = User.objects.annotate(
            active_tasks=Count(
                'assigned_tasks',
                filter=Q(
                    assigned_tasks__is_deleted=False,
                    assigned_tasks__status__in=['pending', 'in_progress']
                )
            ),
            completed_tasks=Count(
                'assigned_tasks',
                filter=Q(
                    assigned_tasks__is_deleted=False,
                    assigned_tasks__status='completed'
                )
            ),
            total_tasks=Count(
                'assigned_tasks',
                filter=Q(assigned_tasks__is_deleted=False)
            )
        ).filter(
            role='employee'
        ).order_by('-active_tasks')
        
        result = []
        for user in workload:
            result.append({
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                'active_tasks': user.active_tasks,
                'completed_tasks': user.completed_tasks,
                'total_tasks': user.total_tasks,
            })
        
        return Response(result)


class ProjectProgressReportView(APIView):
    """
    Get % completion per active project.
    Uses Case/When expressions for conditional aggregation.
    """
    permission_classes = [IsManager]
    
    def get(self, request):
        # Calculate completion percentage for each project
        projects = Project.objects.annotate(
            total_tasks=Count('tasks', filter=Q(tasks__is_deleted=False)),
            completed_tasks=Count(
                'tasks',
                filter=Q(
                    tasks__is_deleted=False,
                    tasks__status='completed'
                )
            ),
            in_progress_tasks=Count(
                'tasks',
                filter=Q(
                    tasks__is_deleted=False,
                    tasks__status='in_progress'
                )
            ),
            pending_tasks=Count(
                'tasks',
                filter=Q(
                    tasks__is_deleted=False,
                    tasks__status='pending'
                )
            )
        ).filter(
            status__in=['active', 'paused']
        ).order_by('-completed_tasks')
        
        result = []
        for project in projects:
            # Calculate completion percentage
            if project.total_tasks > 0:
                completion_percentage = (project.completed_tasks / project.total_tasks) * 100
            else:
                completion_percentage = 0
            
            result.append({
                'project_id': project.id,
                'project_name': project.name,
                'status': project.status,
                'total_tasks': project.total_tasks,
                'completed_tasks': project.completed_tasks,
                'in_progress_tasks': project.in_progress_tasks,
                'pending_tasks': project.pending_tasks,
                'completion_percentage': round(completion_percentage, 2),
            })
        
        return Response(result)


class WeeklyCompletionsReportView(APIView):
    """
    Get tasks completed per day for the last 7 days.
    Uses TruncDay + Count aggregation.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not _has_task_field('updated_at'):
            return Response([])

        # Get date 7 days ago
        week_ago = timezone.now() - timedelta(days=7)
        
        # Group by day and count completed tasks
        completions = Task.objects.filter(
            is_deleted=False,
            status='completed',
            updated_at__gte=week_ago
        ).annotate(
            day=TruncDay('updated_at')
        ).values('day').annotate(
            count=Count('id')
        ).order_by('day')
        
        # Convert to list for easier consumption
        result = [
            {
                'date': item['day'].strftime('%Y-%m-%d'),
                'count': item['count']
            }
            for item in completions
        ]
        
        return Response(result)


class DepartmentSummaryReportView(APIView):
    """
    Get task distribution per department.
    Uses values + annotate.
    """
    permission_classes = [IsManager]
    
    def get(self, request):
        # Count tasks assigned to employees in each department
        department_stats = Department.objects.annotate(
            employee_count=Count('employees', filter=Q(employees__user__role='employee'), distinct=True),
            total_tasks=Count(
                'employees__user__assigned_tasks',
                filter=Q(employees__user__assigned_tasks__is_deleted=False),
                distinct=True
            ),
            completed_tasks=Count(
                'employees__user__assigned_tasks',
                filter=Q(
                    employees__user__assigned_tasks__is_deleted=False,
                    employees__user__assigned_tasks__status='completed'
                ),
                distinct=True
            ),
            active_tasks=Count(
                'employees__user__assigned_tasks',
                filter=Q(
                    employees__user__assigned_tasks__is_deleted=False,
                    employees__user__assigned_tasks__status__in=['pending', 'in_progress']
                ),
                distinct=True
            )
        ).order_by('-total_tasks')
        
        result = []
        for dept in department_stats:
            # Calculate average tasks per employee
            avg_tasks = (dept.total_tasks / dept.employee_count) if dept.employee_count > 0 else 0
            
            result.append({
                'department_id': dept.id,
                'department_name': dept.name,
                'employee_count': dept.employee_count,
                'total_tasks': dept.total_tasks,
                'completed_tasks': dept.completed_tasks,
                'active_tasks': dept.active_tasks,
                'avg_tasks_per_employee': round(avg_tasks, 2),
            })
        
        return Response(result)


class MyDashboardView(APIView):
    """
    Get personalized dashboard data for current user.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # My tasks summary
        my_tasks = Task.objects.filter(
            assigned_to=user,
            is_deleted=False
        )
        
        my_tasks_summary = {
            'total': my_tasks.count(),
            'pending': my_tasks.filter(status='pending').count(),
            'in_progress': my_tasks.filter(status='in_progress').count(),
            'completed': my_tasks.filter(status='completed').count(),
            'overdue': my_tasks.filter(
                deadline__lt=timezone.now(),
                status__in=['pending', 'in_progress']
            ).count(),
        }
        
        # My projects (if manager)
        if user.role == 'manager':
            my_projects = Project.objects.filter(manager=user)
            my_projects_summary = {
                'total': my_projects.count(),
                'active': my_projects.filter(status='active').count(),
                'completed': my_projects.filter(status='completed').count(),
            }
        else:
            # Projects I'm a member of
            my_projects = Project.objects.filter(members=user)
            my_projects_summary = {
                'total': my_projects.count(),
                'active': my_projects.filter(status='active').count(),
            }
        
        # Recent notifications
        unread_notifications = user.notifications.filter(is_read=False).count()
        
        return Response({
            'tasks': my_tasks_summary,
            'projects': my_projects_summary,
            'unread_notifications': unread_notifications,
        })

