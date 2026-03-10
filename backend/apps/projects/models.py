from django.db import models
from django.conf import settings

# Create your models here.
class Project(models.Model):
  STATUS = models.TextChoices("Status", ["active", "paused", "completed", "cancelled"])

  name = models.CharField(max_length=255)
  manager = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="managed_projects" )
  status = models.CharField(max_length=20, blank=True)
  start_date = models.DateField(null=True, blank=True)
  end_date = models.DateField(null=True, blank=True)
  members = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name="projects")

  def __str__(self):
    return self.name