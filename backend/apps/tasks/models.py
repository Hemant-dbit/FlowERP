from django.db import models
from django.conf import settings


class Priority(models.IntegerChoices):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4


class Status(models.TextChoices):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"


class Task(models.Model):
    parent_task = models.ForeignKey("self", null=True, blank=True, on_delete=models.CASCADE, related_name="subtasks")
    project = models.ForeignKey("projects.Project", on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=255)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="assigned_tasks", db_index=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="created_tasks")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    priority = models.IntegerField(choices=Priority.choices, default=Priority.MEDIUM)
    deadline = models.DateTimeField(null=True, blank=True, db_index=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=["assigned_to", "status"]),
            models.Index(fields=["is_deleted"]),
        ]

    def __str__(self):
        return f"{self.title} ({self.project})"


class Comment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)