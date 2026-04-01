from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.users.models import Department
from apps.employees.models import Employee
from apps.projects.models import Project
from apps.tasks.models import Task
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed the database with test data for multiple roles'

    def handle(self, *args, **options):
        try:
            self.stdout.write(self.style.WARNING('Starting test data population...'))

            # Clear existing test data
            if input('Clear existing test data? (y/n): ').lower() == 'y':
                self.stdout.write(self.style.WARNING('Clearing existing test data...'))
                
                # Delete projects first (cascade will handle tasks, comments, etc.)
                Project.objects.filter(name__in=['Website Redesign', 'Mobile App Development']).delete()
                
                # Delete by email and username patterns
                User.objects.filter(email__contains='test').delete()
                User.objects.filter(username__in=['admin_test', 'manager_test', 'emp1', 'emp2', 'emp3', 'emp4']).delete()
                
                # Clear departments last
                Department.objects.filter(name__in=['IT Department', 'HR Department', 'Sales Department']).delete()
                
                self.stdout.write(self.style.SUCCESS('✓ Old test data cleared\n'))

            # Create Departments
            it_dept, _ = Department.objects.get_or_create(
                name='IT Department'
            )
            hr_dept, _ = Department.objects.get_or_create(
                name='HR Department'
            )
            sales_dept, _ = Department.objects.get_or_create(
                name='Sales Department'
            )

            # Create Admin User
            admin, created = User.objects.get_or_create(
                email='admin@test.com',
                defaults={
                    'username': 'admin_test',
                    'first_name': 'Admin',
                    'last_name': 'User',
                    'role': 'admin',
                    'department': it_dept,
                    'is_active': True,
                    'is_staff': True,
                }
            )
            if created:
                admin.set_password('Admin@123')
                admin.save()
                self.stdout.write(self.style.SUCCESS('✓ Admin user created'))
            else:
                self.stdout.write(self.style.WARNING('! Admin user already exists'))

            # Create Manager User
            manager, created = User.objects.get_or_create(
                email='manager@test.com',
                defaults={
                    'username': 'manager_test',
                    'first_name': 'Manager',
                    'last_name': 'User',
                    'role': 'manager',
                    'department': it_dept,
                    'is_active': True,
                }
            )
            if created:
                manager.set_password('Manager@123')
                manager.save()
                self.stdout.write(self.style.SUCCESS('✓ Manager user created'))

            # Create Employee Users
            employees_data = [
                ('employee1@test.com', 'emp1', 'John', 'Doe', it_dept),
                ('employee2@test.com', 'emp2', 'Jane', 'Smith', it_dept),
                ('employee3@test.com', 'emp3', 'Bob', 'Johnson', hr_dept),
                ('employee4@test.com', 'emp4', 'Alice', 'Williams', sales_dept),
            ]

            employee_users = []
            for email, username, first_name, last_name, dept in employees_data:
                emp_user, created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        'username': username,
                        'first_name': first_name,
                        'last_name': last_name,
                        'role': 'employee',
                        'department': dept,
                        'is_active': True,
                    }
                )
                if created:
                    emp_user.set_password('Employee@123')
                    emp_user.save()
                    self.stdout.write(self.style.SUCCESS(f'✓ Employee {first_name} created'))
                employee_users.append(emp_user)

            # Create Employee Profiles
            for user in [admin, manager] + employee_users:
                Employee.objects.get_or_create(
                    user=user,
                    defaults={
                        'position': 'Developer' if user.department == it_dept else 'Specialist',
                        'joining_date': timezone.now().date() - timedelta(days=365),
                    }
                )

            # Create Projects
            project1, created = Project.objects.get_or_create(
                name='Website Redesign',
                defaults={
                    'manager': manager,
                    'status': 'active',
                }
            )
            if created:
                project1.members.set(employee_users[:2])
                self.stdout.write(self.style.SUCCESS('✓ Project 1: Website Redesign created'))

            project2, created = Project.objects.get_or_create(
                name='Mobile App Development',
                defaults={
                    'manager': manager,
                    'status': 'active',
                }
            )
            if created:
                project2.members.set(employee_users)
                self.stdout.write(self.style.SUCCESS('✓ Project 2: Mobile App Development created'))

            # Create Tasks
            # Priority: 1=LOW, 2=MEDIUM, 3=HIGH, 4=CRITICAL
            task_data = [
                ('Design Homepage', project1, employee_users[0], 'pending', 3),
                ('Setup Database', project1, employee_users[1], 'in_progress', 3),
                ('Frontend Development', project2, employee_users[0], 'pending', 2),
                ('Backend API', project2, employee_users[1], 'in_progress', 3),
                ('Testing', project2, employee_users[2], 'pending', 2),
                ('Documentation', project2, employee_users[3], 'pending', 1),
            ]

            for title, project, assigned_to, status, priority in task_data:
                task, created = Task.objects.get_or_create(
                    title=title,
                    project=project,
                    defaults={
                        'assigned_to': assigned_to,
                        'status': status,
                        'priority': priority,
                        'deadline': timezone.now() + timedelta(days=30),
                        'created_by': manager,
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f'✓ Task created: {title}'))

            self.stdout.write(self.style.SUCCESS('\n✓ Test data population completed!\n'))
            self.stdout.write(self.style.WARNING('=== Test Credentials ==='))
            self.stdout.write('Admin: admin@test.com / Admin@123')
            self.stdout.write('Manager: manager@test.com / Manager@123')
            self.stdout.write('Employee: employee1@test.com / Employee@123')
            self.stdout.write('Employee: employee2@test.com / Employee@123')
            self.stdout.write('Employee: employee3@test.com / Employee@123')
            self.stdout.write('Employee: employee4@test.com / Employee@123')
            self.stdout.write(self.style.WARNING('======================\n'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error: {str(e)}'))
            raise
