import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

app = Celery('flowerp')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Celery Beat schedule for periodic tasks
app.conf.beat_schedule = {
    'check-approaching-deadlines': {
        'task': 'apps.tasks.tasks.check_approaching_deadlines',
        'schedule': crontab(hour='9', minute='0'),  # Run daily at 9 AM
    },
    'send-overdue-task-reminders': {
        'task': 'apps.tasks.tasks.send_overdue_task_reminders',
        'schedule': crontab(hour='*/4'),  # Run every 4 hours
    },
    'generate-weekly-summary': {
        'task': 'apps.reports.tasks.generate_weekly_summary',
        'schedule': crontab(day_of_week='monday', hour='8', minute='0'),  # Every Monday at 8 AM
    },
}


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Debug task to test Celery is working."""
    print(f'Request: {self.request!r}')
