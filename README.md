# FlowERP - Internal Workflow & Project Management System

A real-time, high-performance ERP backend and frontend system. Designed to handle enterprise-level internal workflows, featuring a robust architecture that balances real-time communication, background task processing, and strict Role-Based Access Control (RBAC).

🚀 **Live Demo**: https://flow-erp-seven.vercel.app/

---

## 🧪 Demo Credentials

For quick exploration of the platform's RBAC features, use these pre-configured test accounts:

| Role            | Username     | Password   | Access Level                       |
| --------------- | ------------ | ---------- | ---------------------------------- |
| Administrator   | admin        | Admin@123   | Full system configuration & Users  |
| Project Manager | manager_user | Manager@123 | Project creation & Task assignment |
| Employee        | staff_user   | Staff@123   | Personal task tracking             |

---

## 📦 Tech Stack

### Backend

- **Framework**: Django 4.2 / Django REST Framework (DRF)
- **Real-time**: Django Channels (WebSockets)
- **Database**: PostgreSQL 15 (Production) / SQLite (Dev)
- **Cache & Broker**: Redis 7
- **Task Queue**: Celery 5 + Celery Beat (Scheduled tasks)
- **Auth**: JWT (SimpleJWT)
- **Production**: Gunicorn + WhiteNoise

### Frontend

- **Framework**: React 18 (Vite)
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **API Client**: Axios

---

## 📁 Project Structure

```
FlowERP/
├── backend/
│   ├── apps/
│   │   ├── users/              # User & Dept management + Auth
│   │   ├── projects/           # Project CRUD & Management
│   │   ├── tasks/              # Task Management + Celery Tasks
│   │   ├── notifications/      # WebSocket Real-time Notifications
│   │   ├── activity_logs/      # Audit Trail & Activity Tracking
│   │   ├── reports/            # Analytics & Report Generation
│   │   └── employees/          # Employee Data Management
│   ├── config/
│   │   ├── settings/           # Base, Development, Production settings
│   │   ├── celery.py           # Celery Configuration & Beat schedule
│   │   ├── asgi.py             # ASGI (WebSocket support)
│   │   ├── wsgi.py             # WSGI (Production)
│   │   └── urls.py             # URL Routing
│   ├── requirements/
│   │   ├── base.txt            # Core dependencies
│   │   ├── development.txt     # Dev tools
│   │   └── production.txt      # Prod optimizations
│   ├── Dockerfile              # Backend Docker image
│   ├── manage.py               # Django Management CLI
│   └── .env.example            # Environment variables template
│
├── frontend/
│   ├── src/
│   │   ├── modules/            # Feature-based modules
│   │   │   ├── auth/          # Authentication flows
│   │   │   ├── dashboard/     # Dashboard views
│   │   │   ├── projects/      # Project pages
│   │   │   ├── tasks/         # Task management UI
│   │   │   └── reports/       # Analytics views
│   │   ├── routes/            # Route definitions
│   │   ├── services/          # API client services
│   │   ├── shared/            # Reusable components
│   │   └── app/               # Event bus & config
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example
│
├── docker/
│   ├── docker-compose.yml      # PostgreSQL, Redis, Celery services
│   └── Dockerfile.celery       # Celery worker/beat image
│
├── .gitignore
└── README.md
```

---
## 🏗️ System Architecture

- Django handles REST APIs
- Channels handles WebSocket connections
- Redis acts as message broker
- Celery processes background tasks

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/Hemant-dbit/FlowERP.git
cd FlowERP
```

### 2. Backend Setup

```bash
cd backend

# Initialize Virtual Environment
python -m venv .venv
source .venv/bin/activate  # Windows: .\.venv\Scripts\Activate.ps1

# Install Dependencies
pip install -r requirements/development.txt

# Environment Configuration
cp .env.example .env


# Database Migrations
python manage.py migrate

# Create Superuser
python manage.py createsuperuser

# Collect Static Files
python manage.py collectstatic --noinput

# Start Server
python manage.py runserver 8000
```

Access at: **http://localhost:8000**

### 3. Frontend Setup

```bash
cd ../frontend

# Install Dependencies
npm install

# Start Development Server
npm run dev
```

Access at: **http://localhost:5173**

---



## ⚙️ Infrastructure (Docker)

### Start All Services

```bash
# From project root
docker compose -f docker/docker-compose.yml up -d
```

This starts:

- **PostgreSQL 15** (port 5432)
  - User: flowerp
  - Password: flowerp_pass
  - Database: flowerp
- **Redis 7** (port 6379)
- **Celery Worker** (background task execution)
- **Celery Beat** (periodic task scheduling)


Access at: **http://localhost:5555**

---

## 📡 API Design & Real-time Integration

### Key Endpoints

```
POST   /api/v1/auth/login/              # JWT Token Issued
GET    /api/v1/auth/me/                 # Current User
POST   /api/v1/auth/logout/             # Logout

GET    /api/v1/users/                   # List Users
POST   /api/v1/projects/                # Create Project
GET    /api/v1/projects/                # List Projects
GET    /api/v1/projects/{id}/           # Project Detail
GET    /api/v1/projects/{id}/tasks/     # Project Tasks

GET    /api/v1/tasks/                   # List Tasks
POST   /api/v1/tasks/                   # Create Task
GET    /api/v1/tasks/{id}/              # Task Detail
PUT    /api/v1/tasks/{id}/              # Update Task
DELETE /api/v1/tasks/{id}/              # Delete Task

GET    /api/v1/notifications/           # List Notifications
POST   /api/v1/notifications/{id}/mark-read/   # Mark as Read
```



### WebSockets (Real-time)

Real-time alerts are handled via Django Channels.

**Socket URL**: `ws://localhost:8000/ws/notifications/`


---

## 🗂️ Database Models

| Model            | Key Fields                            | Purpose               |
| ---------------- | ------------------------------------- | --------------------- |
| **User**         | username, email, role, department     | Authentication & RBAC |
| **Project**      | name, status, manager, members        | Project organization  |
| **Task**         | title, project, assigned_to, deadline | Task tracking         |
| **Notification** | user, message, type, is_read          | Real-time updates     |
| **ActivityLog**  | user, action, content_type, timestamp | Audit trail           |

---






---

## 📚 Resources

- **API Docs**: http://localhost:8000/api/schema/swagger/
- **Django**: https://docs.djangoproject.com/
- **DRF**: https://www.django-rest-framework.org/
- **Channels**: https://channels.readthedocs.io/
- **Celery**: https://docs.celeryproject.org/
- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/

---

## 🔄 Development Status

- ✅ Models & Migrations
- ✅ JWT Authentication & Authorization
- ✅ RBAC Permissions
- ✅ REST APIs (Full CRUD)
- ✅ WebSocket Real-time Notifications
- ✅ Celery Background Jobs & Scheduling
- ✅ Docker Infrastructure
- 🔄 Frontend (In Progress)
- ⏳ Advanced Analytics & Reporting

---


