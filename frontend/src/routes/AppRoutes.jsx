import { Navigate, Route, Routes } from 'react-router-dom';

import LoginPage from '../modules/auth/pages/LoginPage';
import RegisterPage from '../modules/auth/pages/RegisterPage';
import AdminDashboardPage from '../modules/dashboard/pages/AdminDashboardPage';
import EmployeeDashboardPage from '../modules/dashboard/pages/EmployeeDashboardPage';
import ForbiddenPage from '../modules/dashboard/pages/ForbiddenPage';
import ManagerDashboardPage from '../modules/dashboard/pages/ManagerDashboardPage';
import EmployeesPage from '../modules/employees/pages/EmployeesPage';
import NotificationsPage from '../modules/notifications/pages/NotificationsPage';
import ActivityLogsPage from '../modules/activity-logs/pages/ActivityLogsPage';
import ReportsPage from '../modules/reports/pages/ReportsPage';
import ProjectCreatePage from '../modules/projects/pages/ProjectCreatePage';
import ProjectDetailPage from '../modules/projects/pages/ProjectDetailPage';
import ProjectsPage from '../modules/projects/pages/ProjectsPage';
import TaskCreatePage from '../modules/tasks/pages/TaskCreatePage';
import TaskDetailPage from '../modules/tasks/pages/TaskDetailPage';
import TasksPage from '../modules/tasks/pages/TasksPage';
import useAuthStore from '../modules/auth/store/useAuthStore';
import { DASHBOARD_PATH_BY_ROLE, DEFAULT_ROLE, ROLES } from '../shared/constants/roles';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

const DASHBOARD_ROUTES = [
  {
    role: ROLES.ADMIN,
    path: DASHBOARD_PATH_BY_ROLE[ROLES.ADMIN],
    element: <AdminDashboardPage />,
  },
  {
    role: ROLES.MANAGER,
    path: DASHBOARD_PATH_BY_ROLE[ROLES.MANAGER],
    element: <ManagerDashboardPage />,
  },
  {
    role: ROLES.EMPLOYEE,
    path: DASHBOARD_PATH_BY_ROLE[ROLES.EMPLOYEE],
    element: <EmployeeDashboardPage />,
  },
];

function RoleHomeRedirect() {
  const { role } = useAuthStore();
  const target = DASHBOARD_PATH_BY_ROLE[role] || DASHBOARD_PATH_BY_ROLE[DEFAULT_ROLE];
  return <Navigate to={target} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<RoleHomeRedirect />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tasks/new" element={<TaskCreatePage />} />
        <Route path="/tasks/:id" element={<TaskDetailPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/activity-logs" element={<ActivityLogsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/reports" element={<ReportsPage />} />

        <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]} />}>
          <Route path="/projects/new" element={<ProjectCreatePage />} />
        </Route>

        {DASHBOARD_ROUTES.map((routeConfig) => (
          <Route key={routeConfig.role} element={<RoleRoute allowedRoles={[routeConfig.role]} />}>
            <Route path={routeConfig.path} element={routeConfig.element} />
          </Route>
        ))}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
