# FlowERP - Internal Workflow & Project Management System

Real-time ERP-style backend system built with Django, DRF, Channels, and Celery.

## 📁 Project Structure

```
FlowERP/
├── backend/          # Django REST API + WebSockets
│   ├── apps/        # Django applications (users, projects, tasks, etc.)
│   ├── config/      # Django settings and configuration
│   ├── docker/      # Docker Compose for PostgreSQL + Redis
│   └── manage.py    # Django management script
│
└── frontend/        # Future frontend application (React/Vue)
```

## 🚀 Quick Start

### Backend Setup

```powershell
# Navigate to backend
cd backend

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver 8000
```

### Docker Services

```powershell
# Start PostgreSQL + Redis
docker compose -f backend/docker/docker-compose.yml up -d

# Stop services
docker compose -f backend/docker/docker-compose.yml down
```

## 🔗 API Endpoints

- **Authentication**: `http://localhost:8000/api/v1/auth/`
  - `POST /login/` - Get JWT tokens
  - `POST /register/` - Create new user
  - `GET /me/` - Get current user profile
  - `POST /logout/` - Logout (blacklist token)

- **Admin Panel**: `http://localhost:8000/admin/`

## 🔐 Test Credentials

- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `admin`

## 🛠️ Tech Stack

### Backend

- **Framework**: Django 4.2, Django REST Framework
- **Database**: PostgreSQL 15 (Docker)
- **Cache/Broker**: Redis 7 (Docker)
- **Real-time**: Django Channels (WebSockets)
- **Background Jobs**: Celery
- **Authentication**: JWT (SimpleJWT)

### Frontend (Coming Soon)

- React.js / Vue.js
- WebSocket client for notifications
- Axios for API calls

## 📚 Documentation

See `FlowERP_Build_Guide.md` for complete implementation guide.

## 🔄 Development Status

- ✅ Models & Migrations
- ✅ JWT Authentication
- ✅ RBAC Permissions
- 🔄 REST APIs (In Progress)
- ⏳ WebSocket Notifications
- ⏳ Celery Tasks
- ⏳ Frontend Application

---

**Built for demonstrating backend development skills for Frappe Framework role.**
