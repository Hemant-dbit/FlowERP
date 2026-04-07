# FlowERP - Complete Build & Architecture Guide

A comprehensive guide for understanding, building, and deploying FlowERP from scratch. This document covers the technology stack, architecture decisions, and step-by-step implementation instructions.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Design](#architecture--design)
3. [Technology Stack & Rationale](#technology-stack--rationale)
4. [Data Models](#data-models)
5. [Project Structure](#project-structure)
6. [Prerequisites & Installation](#prerequisites--installation)
7. [Backend Setup](#backend-setup)
8. [Frontend Setup](#frontend-setup)
9. [Docker & Services](#docker--services)
10. [API Architecture](#api-architecture)
11. [Real-time Communication](#real-time-communication)
12. [Background Jobs & Scheduling](#background-jobs--scheduling)
13. [Authentication & Authorization](#authentication--authorization)
14. [Deployment](#deployment)
15. [Development Workflow](#development-workflow)

---

## Project Overview

### What is FlowERP?

**FlowERP** is an internal workflow and project management system designed as an ERP-style application. It demonstrates enterprise-level backend development capabilities suitable for roles like Frappe Framework development.

### Key Features

- ✅ **Real-time Notifications** - WebSocket-based instant updates
- ✅ **Task Management** - Project/task hierarchy with priorities
- ✅ **Team Collaboration** - Multi-user project management
- ✅ **Background Processing** - Celery for async task execution
- ✅ **REST API** - Comprehensive API with JWT authentication
- ✅ **RBAC** - Role-Based Access Control (Admin/Manager/Employee)
- ✅ **Activity Logging** - Track all system actions
- ✅ **Scalable Architecture** - Production-ready deployment

### Primary Use Cases

1. **Project Managers** - Create and manage projects with team members
2. **Employees** - Track assigned tasks with status updates
3. **Administrators** - Manage users, departments, and system-wide settings
4. **Reporting** - Generate insights on project progress and team performance

---

## Architecture & Design

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React Frontend (Vite + React Router + Zustand)     │   │
│  │  - Dashboard, Projects, Tasks, Analytics            │   │
│  │  - WebSocket Client, Axios HTTP Client              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓↑
        ┌──────────────────────────────────────────────┐
        │  HTTP (REST) & WebSocket (Channels)          │
        └──────────────────────────────────────────────┘
                           ↓↑
┌─────────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Django REST Framework + Channels                    │   │
│  │  - Authentication (JWT via SimpleJWT)                │   │
│  │  - REST API Endpoints (CRUD operations)              │   │
│  │  - WebSocket Consumer (Real-time updates)            │   │
│  │  - Middleware (CORS, Security, WhiteNoise)           │   │
│  │  - RBAC Permissions (Custom permission classes)      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓↑
├─────────────────────────────────────────────────────────────┤
│  BUSINESS LOGIC LAYER (Django Apps)                         │
│  ┌──────────────┬───────────┬─────────┬──────────────────┐ │
│  │   Users      │ Projects  │ Tasks   │ Notifications    │ │
│  │  & Roles     │ & Teams   │ & Work  │  & Activity Logs │ │
│  └──────────────┴───────────┴─────────┴──────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  DATA PERSISTENCE & CACHING                                 │
│  ┌──────────────────────────┬──────────────────────────┐    │
│  │  PostgreSQL (Docker)     │  Redis (Docker)          │    │
│  │  - Primary Database      │  - Cache Layer           │    │
│  │  - Data Storage          │  - Message Broker        │    │
│  │  - Persistence           │  - Channel Layer         │    │
│  └──────────────────────────┴──────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  BACKGROUND PROCESSING                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Celery + Celery Beat (Docker containers)            │   │
│  │  - Async Task Processing                             │   │
│  │  - Periodic Job Scheduling                           │   │
│  │  - Report Generation                                 │   │
│  │  - Deadline Reminders & Notifications                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns Used

1. **MVC (Model-View-Controller)** - Django's separation of concerns
2. **RESTful API** - Standard HTTP methods for CRUD operations
3. **Observer Pattern** - WebSocket consumers for real-time updates
4. **Dependency Injection** - Custom permission classes
5. **Factory Pattern** - Django serializers for data transformation
6. **Strategy Pattern** - Multiple authentication backends

---

## Technology Stack & Rationale

### Backend Stack

#### Django 4.2

- **Why**: Industry-standard Python web framework with batteries-included approach
- **What it does**: Handles routing, ORM, admin interface, authentication, permissions
- **Used for**:
  - Project structure and configuration
  - Database migrations and ORM
  - Admin interface for data management
  - Middleware pipeline

#### Django REST Framework (DRF) 3.14

- **Why**: Powerful toolkit for building REST APIs with minimal code
- **What it does**: Serialization, viewsets, routers, pagination, filtering
- **Used for**:
  - Converting models to JSON/XML
  - Automatic CRUD endpoints
  - Request/response validation
  - Built-in browsable API

#### Django Channels 4

- **Why**: Enables WebSocket support for real-time bidirectional communication
- **What it does**: Upgrades Django to handle WebSocket connections
- **Enables**:
  - Real-time notifications
  - Live task status updates
  - Instant team collaboration
  - Push notifications to clients

#### Django Channels Redis 4

- **Why**: Redis backend for Channels to support multi-worker deployments
- **What it does**: Manages channel layers across multiple Celery/Daphne instances
- **Used for**: Distributed message passing between processes

#### Celery 5 + Redis

- **Why**: Distributed task queue for async job processing
- **What it does**: Executes long-running tasks outside request-response cycle
- **Used for**:
  - Sending emails
  - Generating reports
  - Processing bulk updates
  - Scheduled reminders (via Celery Beat)
  - Database cleanup tasks

#### PostgreSQL 15 (Docker)

- **Why**: Enterprise-grade relational database with advanced features
- **What it does**: Stores all structured data with ACID guarantees
- **Used for**:
  - User and project data
  - Task hierarchies (parent-child relationships)
  - Complex queries with joins
  - Full-text search capabilities (if needed)

#### Redis 7 (Docker)

- **Why**: High-performance in-memory data store for multiple use cases
- **What it does**: Acts as cache, message broker, session store
- **Used for**:
  - Celery message broker
  - Channels communication layer
  - Session caching
  - API rate limiting
  - Temporary data storage

#### Gunicorn 21

- **Why**: Production WSGI HTTP server for Django
- **What it does**: Serves Django application with worker processes
- **Configuration**: 4 workers for handling concurrent requests

#### Daphne 4

- **Why**: ASGI server for Django Channels (WebSocket support)
- **What it does**: Handles WebSocket connections alongside HTTP
- **Used for**: Real-time communication infrastructure

#### WhiteNoise 6

- **Why**: Simplified static file serving in production
- **What it does**: Serves CSS, JS, images from Python directly
- **Why important**: Eliminates need for separate web server for static files

#### SimpleJWT 5

- **Why**: JWT token-based authentication (stateless, scalable)
- **What it does**:
  - Generates access/refresh tokens
  - Validates token signatures
  - Manages token blacklist (logout)
- **Token Lifespan**:
  - Access: 60 minutes (short-lived)
  - Refresh: 7 days (long-lived)

#### Django CORS Headers 4

- **Why**: Allow frontend on different domain/port to access API
- **What it does**: Handles Cross-Origin Resource Sharing headers
- **Configured for**: http://localhost:3000 and http://localhost:5173

#### DRF Spectacular 0.27

- **Why**: Auto-generates OpenAPI/Swagger documentation
- **What it does**:
  - Creates interactive API documentation
  - Auto-discovers endpoints and schemas
- **Accessible at**:
  - Swagger UI: /api/schema/swagger/
  - ReDoc: /api/schema/redoc/

#### Pillow 10

- **Why**: Image processing library
- **Used for**: Profile pictures, project thumbnails, media uploads

#### django-environ 0.11

- **Why**: Environment variable management
- **What it does**:
  - Loads .env file
  - Type-safe environment variable access
  - Different settings per environment (dev/prod)

#### psycopg2-binary 2.9

- **Why**: PostgreSQL database adapter for Python
- **What it does**: Enables Django to communicate with PostgreSQL

### Frontend Stack

#### React 18.2

- **Why**: Modern, component-based UI library
- **What it does**:
  - Component-driven architecture
  - Virtual DOM for efficient rendering
  - Rich ecosystem and tooling

#### Vite 5

- **Why**: Next-generation build tool (faster than Webpack)
- **What it does**:
  - Lightning-fast dev server with HMR
  - Optimized production builds
  - ES modules native support
- **Performance**: Development server starts in <100ms

#### React Router DOM 6

- **Why**: Declarative routing for single-page applications
- **What it does**:
  - Client-side navigation
  - Dynamic route matching
  - Nested routes for complex layouts

#### Zustand 4.4

- **Why**: Lightweight state management (simpler than Redux)
- **What it does**:
  - Global state management
  - Minimal boilerplate
  - DevTools integration
  - Side effects handling

#### Axios 1.6

- **Why**: Promise-based HTTP client
- **What it does**:
  - Makes API requests to Django backend
  - Automatic token injection in headers
  - Request/response interceptors
  - Global error handling

#### Tailwind CSS 3.3

- **Why**: Utility-first CSS framework
- **What it does**:
  - Rapid UI development
  - Design system consistency
  - Responsive design utilities
  - Small production bundle

#### PostCSS 8.4

- **Why**: CSS transformation tool
- **What it does**:
  - Processes Tailwind directives
  - Auto-prefixes for browser compatibility
  - CSS optimization

#### ESLint 8.55

- **Why**: JavaScript code quality and consistency
- **What it does**:
  - Lints code for errors
  - Enforces coding standards
  - Prevents common mistakes

---

## Data Models

### Entity-Relationship Diagram

```
┌─────────────┐         ┌─────────────┐
│   Users     │         │ Departments │
├─────────────┤◄──────┐ ├─────────────┤
│ id (PK)     │        └─│ manager_id (FK)
│ username    │          │ name
│ email       │          │ id (PK)
│ role        │
│ department  │
└─────────────┘
       ▲
       │ (many-to-many)
       │
┌──────────────────┐          ┌──────────────┐
│    Projects      │◄─────────│   Tasks      │
├──────────────────┤backing   ├──────────────┤
│ id (PK)          │  members │ id (PK)
│ name             │          │ title
│ manager_id (FK)  │◄─────────│ project_id (FK)
│ status           │assigned  │ assigned_to (FK)
│ start_date       │   tasks  │ created_by (FK)
│ end_date         │          │ status
│ members (M2M)    │          │ priority
└──────────────────┘          │ deadline
                              │ is_deleted
                              │ parent_task (FK - self-referential)
                              └──────────────┘
                                     │
                      ┌──────────────◄┴────────────────┐
                      │                               │
                ┌───────────────┐           ┌────────────────┐
                │   Comments    │           │ Notifications  │
                ├───────────────┤           ├────────────────┤
                │ id (PK)       │           │ id (PK)
                │ task_id (FK)  │           │ user_id (FK)
                │ author_id (FK)│           │ message
                │ content       │           │ type
                │ created_at    │           │ is_read
                └───────────────┘           │ timestamp
                                            └────────────────┘

┌───────────────────┐           ┌─────────────────┐
│  Activity Logs    │           │  Reports        │
├───────────────────┤           ├─────────────────┤
│ id (PK)           │           │ id (PK)
│ user_id (FK)      │           │ title
│ action            │           │ content
│ content_type      │           │ created_at
│ object_id         │           │ created_by (FK)
│ timestamp         │           └─────────────────┘
└───────────────────┘
```

### Model Details

#### User Model (extends Django AbstractUser)

```python
class User(AbstractUser):
    ROLE_CHOICES = [admin, manager, employee]

    role: CharField          # RBAC role
    department: ForeignKey   # Department assignment
```

#### Department Model

```python
class Department:
    name: CharField          # Department name
    manager: ForeignKey      # Department manager (user)
```

#### Project Model

```python
class Project:
    name: CharField
    manager: ForeignKey      # Project lead
    status: CharField        # active, paused, completed, cancelled
    start_date: DateField
    end_date: DateField
    members: ManyToManyField # Team members
```

#### Task Model

```python
class Task:
    project: ForeignKey      # Parent project
    title: CharField
    assigned_to: ForeignKey  # Assigned user
    created_by: ForeignKey   # Creator
    status: CharField        # pending, in_progress, completed, blocked
    priority: IntegerField   # 1=low, 2=medium, 3=high, 4=critical
    deadline: DateTimeField
    parent_task: ForeignKey  # Self-referential for subtasks
    is_deleted: BooleanField
```

#### Comment Model

```python
class Comment:
    task: ForeignKey
    author: ForeignKey
    content: TextField
    created_at: auto_now_add
```

#### Notification Model

```python
class Notification:
    user: ForeignKey
    message: TextField
    type: CharField         # task_assigned, deadline_overdue, reminder
    is_read: BooleanField
    timestamp: auto_now_add
```

---

## Project Structure

```
FlowERP/
│
├── backend/                          # Django REST API
│   ├── apps/
│   │   ├── users/                    # User management & authentication
│   │   │   ├── models.py            # User, Department models
│   │   │   ├── serializers.py       # User serializers
│   │   │   ├── views.py             # User endpoints
│   │   │   ├── permissions.py       # Custom permission classes
│   │   │   ├── urls.py              # User routes
│   │   │   └── migrations/
│   │   │
│   │   ├── projects/                 # Project management
│   │   │   ├── models.py            # Project model
│   │   │   ├── serializers.py
│   │   │   ├── views.py             # CRUD endpoints
│   │   │   ├── signals.py           # Django signals for auto-updates
│   │   │   └── urls.py
│   │   │
│   │   ├── tasks/                    # Task management
│   │   │   ├── models.py            # Task, Comment models
│   │   │   ├── serializers.py
│   │   │   ├── views.py             # Task CRUD + filtering
│   │   │   ├── tasks.py             # Celery background tasks
│   │   │   │   └── check_approaching_deadlines()
│   │   │   │   └── send_overdue_task_reminders()
│   │   │   └── urls.py
│   │   │
│   │   ├── notifications/            # Real-time notifications
│   │   │   ├── models.py            # Notification model
│   │   │   ├── consumers.py         # WebSocket consumer
│   │   │   ├── routing.py           # WebSocket URL routing
│   │   │   ├── serializers.py
│   │   │   ├── views.py             # API endpoints
│   │   │   └── urls.py
│   │   │
│   │   ├── activity_logs/            # Activity tracking
│   │   │   ├── models.py
│   │   │   └── signals.py            # Auto-log actions
│   │   │
│   │   ├── reports/                  # Analytics & Reports
│   │   │   ├── models.py
│   │   │   ├── tasks.py             # generate_weekly_summary()
│   │   │   └── views.py
│   │   │
│   │   └── employees/                # Employee management
│   │       ├── models.py
│   │       └── views.py
│   │
│   ├── config/                       # Django settings & WSGI
│   │   ├── settings/
│   │   │   ├── base.py              # Base settings (shared)
│   │   │   ├── development.py       # Dev-specific
│   │   │   ├── production.py        # Prod-specific
│   │   │   └── __init__.py
│   │   │
│   │   ├── celery.py                # Celery configuration
│   │   ├── asgi.py                  # ASGI config (Channels/WebSocket)
│   │   ├── wsgi.py                  # WSGI config (Gunicorn)
│   │   ├── urls.py                  # Root URL router
│   │   └── __init__.py
│   │
│   ├── requirements/                 # Package dependencies
│   │   ├── base.txt                 # Common packages
│   │   ├── development.txt          # Dev tools
│   │   └── production.txt           # Prod optimizations
│   │
│   ├── Dockerfile                    # Docker image for backend
│   ├── manage.py                     # Django CLI
│   ├── db.sqlite3                    # Local dev database
│   └── .env.example                  # Environment variables template
│
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── app/
│   │   │   └── eventBus.js          # Global event emitter
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/                # Authentication flows
│   │   │   ├── dashboard/           # Dashboard views
│   │   │   ├── projects/            # Project pages
│   │   │   ├── tasks/               # Task management UI
│   │   │   └── reports/             # Analytics views
│   │   │
│   │   ├── routes/
│   │   │   └── index.jsx            # Route definitions
│   │   │
│   │   ├── services/
│   │   │   ├── api.js               # Axios instance + config
│   │   │   ├── authService.js       # Auth API calls
│   │   │   ├── projectService.js    # Project API calls
│   │   │   └── taskService.js       # Task API calls
│   │   │
│   │   ├── shared/
│   │   │   ├── components/          # Reusable UI components
│   │   │   ├── hooks/               # Custom React hooks
│   │   │   ├── utils/               # Utility functions
│   │   │   └── constants/           # App constants
│   │   │
│   │   ├── App.jsx                  # Root component
│   │   └── main.jsx                 # Vue entry point
│   │
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example
│
├── docker/                           # Docker services
│   ├── docker-compose.yml           # PostgreSQL + Redis + Celery
│   └── Dockerfile.celery            # Celery worker/beat image
│
├── .gitignore
└── README.md
```

---

## Prerequisites & Installation

### System Requirements

```
✓ Python 3.10+
✓ Node.js 16+
✓ Docker & Docker Compose
✓ Git
✓ 4GB RAM minimum
✓ 10GB disk space
```

### Installation Steps

#### 1. Clone Repository

```bash
git clone https://github.com/Hemant-dbit/FlowERP.git
cd FlowERP
```

#### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv .venv

# Activate (Windows)
.\.venv\Scripts\Activate.ps1

# Activate (macOS/Linux)
source .venv/bin/activate

# Install dependencies
pip install -r requirements/development.txt
```

#### 3. Environment Configuration

Create `backend/.env`:

```bash
# Core Django
SECRET_KEY=your-secret-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (SQLite for dev)
DATABASE_URL=sqlite:///db.sqlite3
# For PostgreSQL: postgresql://user:pass@localhost:5432/flowerp

# Redis (for Channels, Celery)
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# Frontend URLs (CORS)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# JWT Settings (optional - defaults used in code)
JWT_SECRET=your-jwt-secret
```

#### 4. Database Setup

```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
# Username: admin
# Email: admin@example.com
# Password: admin123 (for dev only!)

# Collect static files
python manage.py collectstatic --noinput
```

#### 5. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create .env (if needed)
# VITE_API_URL=http://localhost:8000
```

---

## Backend Setup

### Django Apps Configuration

#### 1. Users App

**Purpose**: Authentication, authorization, user management

**Key Components**:

- `User` model extends Django's `AbstractUser`
- Adds `role` field for RBAC
- Adds `department` field for organizational structure

**Custom Permissions**:

```python
# In apps/users/permissions.py
- IsAdmin: Only admins
- IsManager: Admins + managers
- IsOwnerOrAdmin: Resource owner or admin
```

#### 2. Projects App

**Purpose**: Project lifecycle management

**Features**:

- Create projects with team members
- Assign managers
- Track project status (active/paused/completed/cancelled)
- Set timelines

**Signals**:

- Auto-create notifications when project status changes
- Log activity when project is updated

#### 3. Tasks App

**Purpose**: Task management with hierarchy support

**Features**:

- Create tasks within projects
- Assign to team members
- Priority levels (LOW/MEDIUM/HIGH/CRITICAL)
- Status tracking (PENDING/IN_PROGRESS/COMPLETED/BLOCKED)
- Subtasks (self-referential parent_task)
- Soft delete (is_deleted flag)

**Indexes for Performance**:

```python
- Index on (assigned_to, status) - Fast filtering
- Index on deadline - Fast sorting
- Index on is_deleted - Exclude deleted tasks
```

**Celery Tasks**:

```python
check_approaching_deadlines()
  # Runs daily at 9 AM
  # Checks tasks due within 24 hours
  # Creates notifications for assignees

send_overdue_task_reminders()
  # Runs every 4 hours
  # Finds overdue tasks
  # Sends reminders to assignees
```

#### 4. Notifications App

**Purpose**: Real-time notifications & activity feed

**Features**:

- Store notification records
- Mark as read/unread
- WebSocket consumer for real-time pushes
- Types: task_assigned, deadline_overdue, reminder

**WebSocket Workflow**:

```
Client connects via WebSocket
  ↓
Django Channels Consumer activates
  ↓
Consumer subscribes to notification group
  ↓
When task is assigned/updated:
  - Django signal triggered
  - Notification created in DB
  - WebSocket message sent to group
  ↓
Client receives real-time update
```

#### 5. Activity Logs App

**Purpose**: Audit trail of all system actions

**Implementation**:

- Django signals capture model changes
- Records: who did what, when
- Stores into ActivityLog model
- Used for compliance and debugging

#### 6. Reports App

**Purpose**: Analytics and business intelligence

**Celery Task**:

```python
generate_weekly_summary()
  # Runs every Monday at 8 AM
  # Calculates:
  # - Tasks completed this week
  # - On-time delivery rate
  # - Team productivity metrics
  # - Project progress
  # - Generates Report object
```

---

## Frontend Setup

### React Component Structure

```
App.jsx (Root)
  ├── Layout/Components
  │   ├── Navbar
  │   ├── Sidebar
  │   └── Footer
  │
  ├── Routes (React Router)
  │   ├── /login -> AuthModule/LoginPage
  │   ├── /dashboard -> DashboardModule/Dashboard
  │   ├── /projects -> ProjectsModule/ProjectsList
  │   │   ├── /projects/:id -> ProjectDetail
  │   │   └── /projects/new -> CreateProject
  │   │
  │   ├── /tasks -> TasksModule/TasksList
  │   │   ├── /tasks/:id -> TaskDetail
  │   │   └── /tasks/new -> CreateTask
  │   │
  │   └── /reports -> ReportsModule/Analytics
  │
  ├── Global State (Zustand)
  │   ├── authStore - User, tokens
  │   ├── projectStore - Projects list, current project
  │   ├── taskStore - Tasks, filters
  │   └── notificationStore - Notifications
  │
  └── WebSocket Client
      └── Connects to /ws/notifications/
          Receives real-time updates
```

### Key Frontend Services

#### API Service (Axios)

```javascript
// services/api.js
const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  timeout: 10000,
});

// Interceptor: Inject JWT token in headers
api.interceptors.request.use((config) => {
  const token = authStore.get().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor: Handle 401 refresh token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Attempt to refresh token
      // If fails, redirect to login
    }
    return Promise.reject(error);
  },
);
```

#### WebSocket Service

```javascript
// Real-time notification connection
const ws = new WebSocket("ws://localhost:8000/ws/notifications/");

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  notificationStore.addNotification(notification);
  // Update UI in real-time
};
```

---

## Docker & Services

### Docker Compose Services

#### PostgreSQL 15

```yaml
- Image: postgres:15
- Port: 5432
- Volume: pgdata (persistent)
- Default Credentials:
    - User: flowerp
    - Password: flowerp_pass
    - Database: flowerp
```

#### Redis 7

```yaml
- Image: redis:7-alpine
- Port: 6379
- Purpose:
    - Celery broker
    - Channels layer
    - Caching
```

#### Celery Worker

```yaml
- Dockerfile: docker/Dockerfile.celery
- Command: celery -A config worker --loglevel=info
- Environment: Points to PostgreSQL + Redis
- Purpose: Executes async tasks
```

#### Celery Beat

```yaml
- Same Dockerfile as worker
- Command: celery -A config beat --loglevel=info
- Purpose: Schedules periodic tasks
- Tasks:
    - Daily deadline reminders (9 AM)
    - Hourly overdue reminders (every 4 hours)
    - Weekly summary generation (Monday 8 AM)
```

### Starting Docker Services

```bash
# From project root
docker compose -f docker/docker-compose.yml up -d

# View logs
docker compose -f docker/docker-compose.yml logs -f

# Stop services
docker compose -f docker/docker-compose.yml down

# Remove volumes (reset data)
docker compose -f docker/docker-compose.yml down -v
```

---

## API Architecture

### Authentication Flow

```
1. User submits credentials
   POST /api/v1/auth/login/
   {username, password}
       ↓
2. Server validates & generates tokens
   {access_token, refresh_token}
       ↓
3. Frontend stores tokens in localStorage
   Axios injects: Authorization: Bearer <access_token>
       ↓
4. Every request includes token
   DRF validates via JWTAuthentication
       ↓
5. Token expires (60 min)
   Frontend auto-refreshes using refresh_token
   POST /api/v1/auth/token/refresh/
   {refresh_token}
       ↓
6. Get new access_token
   Continue making requests
       ↓
7. User logout
   POST /api/v1/auth/logout/
   Refresh token added to blacklist
```

### API Endpoint Structure

```
/api/v1/
│
├── auth/
│   ├── login/ [POST]
│   ├── register/ [POST]
│   ├── logout/ [POST]
│   ├── token/refresh/ [POST]
│   └── me/ [GET] - Current user profile
│
├── users/
│   ├── [GET,POST] - List/create users
│   ├── {id}/ [GET,PUT,DELETE] - User detail
│   └── {id}/projects/ [GET] - User projects
│
├── projects/
│   ├── [GET,POST]
│   ├── {id}/ [GET,PUT,DELETE]
│   ├── {id}/tasks/ [GET]
│   └── {id}/members/ [GET,POST,DELETE]
│
├── tasks/
│   ├── [GET,POST]
│   ├── {id}/ [GET,PUT,DELETE]
│   ├── {id}/comments/ [GET,POST]
│   └── {id}/subtasks/ [GET]
│
├── notifications/
│   ├── [GET] - List notifications
│   ├── {id}/mark-read/ [POST]
│   └── mark-all-read/ [POST]
│
└── reports/
    └── weekly-summary/ [GET] - Get latest report
```

### Request/Response Examples

#### Login

```bash
POST /api/v1/auth/login/
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response 200:
{
  "access": "eyJ0eXAiOiJKV1...",
  "refresh": "eyJ0eXAiOiJKV1..."
}
```

#### Create Task

```bash
POST /api/v1/tasks/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "project": 1,
  "title": "Build API endpoint",
  "assigned_to": 2,
  "priority": 3,
  "deadline": "2025-04-15T17:00:00Z"
}

Response 201:
{
  "id": 42,
  "title": "Build API endpoint",
  "status": "pending",
  "priority": 3,
  "assigned_to": 2,
  "created_at": "2025-04-07T10:30:00Z"
}
```

---

## Real-time Communication

### WebSocket Connection Flow

```
Frontend                          Backend
   │                                │
   ├─────── WebSocket Connect ─────→│
   │                                ├─ Create Consumer instance
   │                                ├─ Add to notification group
   │                                │
   │←──── WebSocket Connected ─────┤
   │                                │
   │  (User creates task)           │
   │                                │
   │  ┌─ POST /api/v1/tasks/ ─────→│
   │  │                             ├─ Save Task to DB
   │  │                             ├─ Create Activity Log
   │  │                             ├─ Emit Django Signal
   │  │         201 Response ◄─────┤
   │  └────────────────────────────┘
   │                                ├─ Signal Handler fires
   │                                ├─ Create Notification
   │                                ├─ Send to WebSocket group
   │                                │
   │←─ WebSocket Message ───────────│
   │   {notification: {...}}        │
   │                                │
   ├─ Update UI in real-time ──────→│ (Frontend updates)
```

### WebSocket Consumer (Django Channels)

```python
# apps/notifications/consumers.py

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Called when WebSocket connects
        self.user_id = self.scope['user'].id
        self.group_name = f'notifications_{self.user_id}'

        # Join notification group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Called when WebSocket disconnects
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def send_notification(self, event):
        # Called when message sent to group
        await self.send(text_data=json.dumps({
            'type': event['type'],
            'message': event['message']
        }))
```

### Signal-based Notification Trigger

```python
# When task is assigned:
@receiver(post_save, sender=Task)
def task_assigned_handler(sender, instance, created, **kwargs):
    if created and instance.assigned_to:
        # Create notification
        notification = Notification.objects.create(
            user=instance.assigned_to,
            message=f"Task assigned: {instance.title}",
            type='task_assigned'
        )

        # Send via WebSocket
        async_to_sync(channel_layer.group_send)(
            f'notifications_{instance.assigned_to.id}',
            {
                'type': 'send_notification',
                'message': notification.message
            }
        )
```

---

## Background Jobs & Scheduling

### Celery Configuration

```python
# config/celery.py

app = Celery('flowerp')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Celery Beat Schedule (Periodic Tasks)
app.conf.beat_schedule = {
    'check-approaching-deadlines': {
        'task': 'apps.tasks.tasks.check_approaching_deadlines',
        'schedule': crontab(hour='9', minute='0'),  # Daily 9am
    },
    'send-overdue-reminders': {
        'task': 'apps.tasks.tasks.send_overdue_task_reminders',
        'schedule': crontab(hour='*/4'),  # Every 4 hours
    },
    'weekly-summary': {
        'task': 'apps.reports.tasks.generate_weekly_summary',
        'schedule': crontab(day_of_week='monday', hour='8'),
    },
}
```

### Task Examples

#### Approaching Deadline Check

```python
@shared_task
def check_approaching_deadlines():
    """
    Find all tasks with deadlines within 24 hours
    Create notifications for assignees
    """
    now = timezone.now()
    tomorrow = now + timedelta(days=1)

    upcoming_tasks = Task.objects.filter(
        deadline__range=[now, tomorrow],
        status__in=['pending', 'in_progress']
    )

    for task in upcoming_tasks:
        Notification.objects.create(
            user=task.assigned_to,
            message=f"Deadline for '{task.title}' is tomorrow!",
            type='deadline_overdue'
        )

        # Notify via WebSocket
        send_notification_via_websocket(task.assigned_to.id, message)
```

#### Weekly Summary Report

```python
@shared_task
def generate_weekly_summary():
    """
    Generate weekly productivity report
    Aggregates task completion, team performance, etc.
    """
    start_date = timezone.now() - timedelta(days=7)

    completed_tasks = Task.objects.filter(
        status='completed',
        updated_at__gte=start_date
    ).count()

    total_tasks = Task.objects.filter(
        created_at__gte=start_date
    ).count()

    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

    report = Report.objects.create(
        title=f"Weekly Summary - {timezone.now().date()}",
        content={
            'tasks_completed': completed_tasks,
            'tasks_created': total_tasks,
            'completion_rate': completion_rate,
            'generated_at': timezone.now().isoformat()
        }
    )

    # Notify admins about report
    for admin in User.objects.filter(role='admin'):
        send_report_notification(admin, report)
```

---

## Authentication & Authorization

### JWT Token Structure

```
Access Token (60 min lifetime):
  Header: {typ: 'JWT', alg: 'HS256'}
  Payload:
    {
      token_type: 'access',
      exp: 1680123456,
      iat: 1680119856,
      user_id: 1,
      username: 'admin'
    }
  Signature: HMACSHA256(base64(header) + base64(payload), SECRET_KEY)

Refresh Token (7 days lifetime):
  Header: {typ: 'JWT', alg: 'HS256'}
  Payload:
    {
      token_type: 'refresh',
      exp: 1680728256,
      iat: 1680123856,
      user_id: 1,
      jti: 'unique_id'
    }
```

### RBAC (Role-Based Access Control)

```python
ROLES = {
    'admin': {
        'permissions': ['create', 'read', 'update', 'delete', 'manage_users'],
        'can_access': ['all_projects', 'all_tasks', 'settings']
    },
    'manager': {
        'permissions': ['create', 'read', 'update', 'manage_team'],
        'can_access': ['own_projects', 'assigned_tasks']
    },
    'employee': {
        'permissions': ['read', 'update_own'],
        'can_access': ['assigned_tasks']
    }
}
```

### Custom Permission Classes

```python
# apps/users/permissions.py

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'admin'

class IsManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role in ['admin', 'manager']

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user
```

### Middleware Security Order

```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

**Order Significance**:

1. CORS headers (allow cross-origin requests)
2. WhiteNoise (static file serving)
3. Security (add security headers)
4. Session & CSRF (prevent CSRF attacks)
5. Auth (identify user)

---

## Deployment

### Production Checklist

```
[ ] DEBUG = False
[ ] SECRET_KEY = new random key
[ ] ALLOWED_HOSTS = production domain
[ ] SECURE_SSL_REDIRECT = True
[ ] SESSION_COOKIE_SECURE = True
[ ] CSRF_COOKIE_SECURE = True
[ ] Run collectstatic
[ ] Run migrations
[ ] Create superuser
[ ] Set environment variables
[ ] Test on staging first
```

### Deployment Options

#### 1. Docker Compose (Self-hosted)

```bash
# Build images
docker compose build

# Run all services
docker compose up -d

# View logs
docker compose logs -f
```

#### 2. Render (Free Tier)

- See `FREE_DEPLOYMENT_QUICK_START.md`
- Uses gunicorn for WSGI
- Automatic SSL/TLS

#### 3. AWS ECS/EKS

- Containerized deployment
- Auto-scaling
- Load balancing

### Gunicorn Configuration

```bash
gunicorn config.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 4 \
  --worker-class sync \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
```

**Worker Calculation**: workers = (2 × CPU cores) + 1

---

## Development Workflow

### Creating a New Feature

#### 1. Model Definition

```python
# apps/task/models.py
class AttachmentModel(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    file = models.FileField(upload_to='task_attachments/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
```

#### 2. Create Migration

```bash
python manage.py makemigrations task
python manage.py migrate
```

#### 3. Serializer

```python
# apps/task/serializers.py
class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'task', 'file', 'uploaded_at']
```

#### 4. ViewSet

```python
# apps/task/views.py
class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
    permission_classes = [IsAuthenticated]
```

#### 5. URL Routing

```python
# config/urls.py
router = DefaultRouter()
router.register('attachments', AttachmentViewSet)

urlpatterns = [
    path('api/v1/', include(router.urls)),
]
```

#### 6. Test

```bash
# Test API
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/v1/attachments/

# Test locally
python manage.py test apps.task
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/task-attachments

# Make changes
git add .
git commit -m "Add task attachment feature"

# Push branch
git push origin feature/task-attachments

# Create Pull Request on GitHub
# Request code review
# Merge after approval
```

---

## Performance Optimization Tips

### Database

- Use `select_related()` for foreign keys
- Use `prefetch_related()` for M2M
- Add database indexes
- Use pagination (default 20 items)

### Caching

- Enable Redis caching layer
- Cache API responses (5 min TTL)
- Cache user permissions

### API

- Implement field filtering
- Use sparse fieldsets
- Compression (gzip)
- Rate limiting (throttling)

### Frontend

- Code splitting
- Lazy loading images
- Minimize bundle size
- Service workers for offline

---

## Troubleshooting

### Database Errors

```
# Reset database (dev only!)
python manage.py migrate zero
python manage.py migrate

# Or with Docker:
docker compose down -v
docker compose up -d
```

### WebSocket Not Connecting

```
# Ensure Daphne is running instead of Runserver
# Or use: python manage.py runserver_plus --upgrade
```

### CORS Errors

```
# Check CORS_ALLOWED_ORIGINS in .env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Celery Tasks Not Running

```
# Ensure Redis is running
redis-cli ping

# Ensure Celery worker is running
celery -A config worker -l info

# Check flower dashboard
flower -A config --port=5555
# Visit http://localhost:5555
```

---

## Support & Resources

- **Django Docs**: https://docs.djangoproject.com/
- **DRF Docs**: https://www.django-rest-framework.org/
- **Channels**: https://channels.readthedocs.io/
- **Celery**: https://docs.celeryproject.org/
- **React**: https://react.dev/
- **PostgreSQL**: https://www.postgresql.org/docs/

---

**Last Updated**: April 7, 2026
**Version**: 2.0 - Comprehensive Architecture Guide
**Status**: Production Ready
