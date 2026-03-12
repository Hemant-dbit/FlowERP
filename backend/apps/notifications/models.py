from django.db import models
from django.conf import settings


class Notification(models.Model):
    NOTIF_TYPES = [
        ("task_assigned", "Task assigned"),
        ("deadline_overdue", "Deadline overdue"),
        ("reminder", "Reminder"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    message = models.TextField()
    type = models.CharField(max_length=50, choices=NOTIF_TYPES, default="reminder")
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["user", "is_read"])]