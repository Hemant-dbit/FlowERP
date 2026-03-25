"""
Management command to test Celery tasks manually.
Usage: python manage.py test_celery_task <task_name>
"""
from django.core.management.base import BaseCommand
from apps.tasks.tasks import (
    check_approaching_deadlines,
    send_overdue_task_reminders,
    cleanup_old_notifications
)
from apps.reports.tasks import (
    generate_weekly_summary,
    generate_project_status_report,
    archive_old_activity_logs
)


class Command(BaseCommand):
    help = 'Test Celery tasks manually'

    def add_arguments(self, parser):
        parser.add_argument(
            'task_name',
            type=str,
            help='Name of the task to run',
            choices=[
                'check_deadlines',
                'overdue_reminders',
                'cleanup_notifications',
                'weekly_summary',
                'project_report',
                'archive_logs',
            ]
        )
        parser.add_argument(
            '--project-id',
            type=int,
            help='Project ID for project_report task',
            default=None
        )

    def handle(self, *args, **options):
        task_name = options['task_name']
        
        self.stdout.write(self.style.WARNING(f'\nRunning task: {task_name}...\n'))
        
        try:
            if task_name == 'check_deadlines':
                result = check_approaching_deadlines.delay()
                self.stdout.write(self.style.SUCCESS(f'Task queued: {result.id}'))
                
            elif task_name == 'overdue_reminders':
                result = send_overdue_task_reminders.delay()
                self.stdout.write(self.style.SUCCESS(f'Task queued: {result.id}'))
                
            elif task_name == 'cleanup_notifications':
                result = cleanup_old_notifications.delay()
                self.stdout.write(self.style.SUCCESS(f'Task queued: {result.id}'))
                
            elif task_name == 'weekly_summary':
                result = generate_weekly_summary.delay()
                self.stdout.write(self.style.SUCCESS(f'Task queued: {result.id}'))
                
            elif task_name == 'project_report':
                project_id = options.get('project_id')
                if not project_id:
                    self.stdout.write(self.style.ERROR('--project-id is required for project_report'))
                    return
                result = generate_project_status_report.delay(project_id)
                self.stdout.write(self.style.SUCCESS(f'Task queued: {result.id}'))
                
            elif task_name == 'archive_logs':
                result = archive_old_activity_logs.delay()
                self.stdout.write(self.style.SUCCESS(f'Task queued: {result.id}'))
            
            self.stdout.write(self.style.SUCCESS(f'\n✅ Task {task_name} has been queued for execution\n'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n❌ Error: {str(e)}\n'))
