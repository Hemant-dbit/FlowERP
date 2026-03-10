from django.db import models
from django.contrib.auth.models import AbstractUser

ROLE_CHOICES = [
  ("admin", "Admin"),
  ("manager", "Manager"),
  ("employee", "Employee"),
]

class Department(models.Model):
  name = models.CharField(max_length=100)
  manager = models.ForeignKey("users.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="managed_departments" )

  def __str__(self):
    return self.name
  
class User(AbstractUser):
  role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="employee")
  department = models.ForeignKey("users.Department", null=True, blank=True, on_delete=models.SET_NULL)

  def __str__(self):
    return self.username