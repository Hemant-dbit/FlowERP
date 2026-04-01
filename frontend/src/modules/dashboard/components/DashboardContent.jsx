import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import useAuthStore from '../../auth/store/useAuthStore';
import NotificationBell from '../../notifications/components/NotificationBell';
import useNotificationsStore from '../../notifications/store/useNotificationsStore';
import { ROLES } from '../../../shared/constants/roles';
import useDashboardStore from '../store/useDashboardStore';

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value ?? 0}</p>
    </div>
  );
}

export default function DashboardContent({ title, subtitle, showManagerWidgets = false }) {
  const { user, logout } = useAuthStore();
  const { loading, error, myDashboard, tasksByStatus, overview, projectProgress } =
    useDashboardStore();
  const { unreadCount, fetchUnreadCount, startPolling, stopPolling } = useNotificationsStore();
  const [activeSection, setActiveSection] = useState('my-dashboard');
  const isManagerOrAdmin = user?.role === ROLES.ADMIN || user?.role === ROLES.MANAGER;

  useEffect(() => {
    fetchUnreadCount();
    startPolling(30000);

    return () => {
      stopPolling();
    };
  }, [fetchUnreadCount, startPolling, stopPolling]);

  const taskSummary = myDashboard?.tasks || {};
  const projectSummary = myDashboard?.projects || {};

  const sections = useMemo(() => {
    const baseSections = [
      { id: 'my-dashboard', label: 'My Dashboard' },
      { id: 'task-status', label: 'Task Status' },
    ];

    if (showManagerWidgets) {
      return [
        ...baseSections,
        { id: 'overview', label: 'Overview' },
        { id: 'project-progress', label: 'Project Progress' },
      ];
    }

    return baseSections;
  }, [showManagerWidgets]);

  const renderActiveSection = () => {
    if (activeSection === 'my-dashboard') {
      return (
        <section>
          <h2>My Dashboard</h2>
          <div className="stats-grid">
            <StatCard label="My Total Tasks" value={taskSummary.total} />
            <StatCard label="My Pending" value={taskSummary.pending} />
            <StatCard label="My In Progress" value={taskSummary.in_progress} />
            <StatCard label="My Completed" value={taskSummary.completed} />
            <StatCard label="My Overdue" value={taskSummary.overdue} />
            <StatCard label="My Projects" value={projectSummary.total} />
            <StatCard label="My Active Projects" value={projectSummary.active} />
            <StatCard label="Unread Notifications" value={myDashboard?.unread_notifications} />
          </div>
        </section>
      );
    }

    if (activeSection === 'task-status') {
      return (
        <section>
          <h2>Task Status Snapshot</h2>
          <div className="stats-grid">
            <StatCard label="Pending" value={tasksByStatus?.pending} />
            <StatCard label="In Progress" value={tasksByStatus?.in_progress} />
            <StatCard label="Completed" value={tasksByStatus?.completed} />
            <StatCard label="Blocked" value={tasksByStatus?.blocked} />
          </div>
        </section>
      );
    }

    if (activeSection === 'overview') {
      return (
        <section>
          <h2>Overview (Manager/Admin)</h2>
          <div className="stats-grid">
            <StatCard label="Total Users" value={overview?.total_users} />
            <StatCard label="Total Projects" value={overview?.total_projects} />
            <StatCard label="Total Tasks" value={overview?.total_tasks} />
            <StatCard label="Overdue Tasks" value={overview?.overdue_tasks} />
            <StatCard label="Active Projects" value={overview?.active_projects} />
            <StatCard label="Completed This Month" value={overview?.completed_this_month} />
          </div>
        </section>
      );
    }

    return (
      <section>
        <h2>Project Progress (Top 5)</h2>
        <div className="progress-list">
          {(projectProgress || []).slice(0, 5).map((project) => (
            <div className="progress-item" key={project.project_id}>
              <p>{project.project_name}</p>
              <p>{project.completion_percentage}% complete</p>
            </div>
          ))}
          {projectProgress && projectProgress.length === 0 ? (
            <p>No project progress data.</p>
          ) : null}
        </div>
      </section>
    );
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
          <p>Signed in as: {user?.username || 'user'}</p>
        </div>
        <div className="dashboard-header-actions">
          <NotificationBell unreadCount={unreadCount} />
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {loading ? <p>Loading dashboard data...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <div className="dashboard-body">
        <aside className="dashboard-sidebar">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`sidebar-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </button>
          ))}

          <div className="sidebar-links">
            <p className="sidebar-links-title">Quick Links</p>
            <Link to="/projects" className="sidebar-link-item">
              Projects
            </Link>
            <Link to="/tasks" className="sidebar-link-item">
              Tasks
            </Link>
            {/* <Link to="/notifications" className="sidebar-link-item">
              Notifications
            </Link> */}
            {/* <Link to="/activity-logs" className="sidebar-link-item">
              Activity Logs
            </Link> */}
            {isManagerOrAdmin && (
              <>
                <Link to="/employees" className="sidebar-link-item">
                  Employees
                </Link>
                <Link to="/reports" className="sidebar-link-item">
                  Reports
                </Link>
              </>
            )}
          </div>
        </aside>

        <main className="dashboard-main">{renderActiveSection()}</main>
      </div>
    </div>
  );
}
