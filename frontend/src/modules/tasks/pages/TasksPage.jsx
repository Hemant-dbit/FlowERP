import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../auth/store/useAuthStore';
import { DASHBOARD_PATH_BY_ROLE, ROLES } from '../../../shared/constants/roles';
import useTasksStore from '../store/useTasksStore';

export default function TasksPage() {
  const { role } = useAuthStore();
  const { loading, error, tasks, fetchTasks, clearError } = useTasksStore();
  const dashboardPath = DASHBOARD_PATH_BY_ROLE[role] || DASHBOARD_PATH_BY_ROLE[ROLES.EMPLOYEE];

  useEffect(() => {
    fetchTasks({ mine: role === 'employee' });
  }, [fetchTasks, role]);

  return (
    <div className="tasks-page feature-page-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: 0 }}>
        <Link
          to={dashboardPath}
          className="back-dashboard-btn"
          style={{
            padding: '0.45rem',
            background: 'none',
            color: '#3730a3',
            border: 'none',
            fontSize: '1.7rem',
            margin: 0,
            borderRadius: '50%',
            minWidth: 0,
            minHeight: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Back to Dashboard"
        >
          <span style={{ fontWeight: 700, fontSize: '1.7rem', lineHeight: 1 }}>&#8592;</span>
        </Link>
        <h1 style={{ margin: 0, fontSize: '2rem', lineHeight: 1.1 }}>Tasks</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: 0 }}>
        <p style={{ margin: 0, fontSize: '1.08rem', color: '#555', flex: 1 }}>
          {role === 'employee' ? 'Tasks assigned to or created by you' : 'All accessible tasks'}
        </p>
        <Link to="/tasks/new" className="main-action-btn">
          Create Task
        </Link>
      </div>

      {error ? (
        <p className="error-text" onClick={clearError}>
          {error}
        </p>
      ) : null}

      <div className="task-list">
        {tasks.map((task) => (
          <article key={task.id} className="task-card">
            <div>
              <h3>{task.title}</h3>
              <p>Project: {task.project_name || 'n/a'}</p>
              <p>Assigned: {task.assigned_to_name || 'Unassigned'}</p>
              <p>Status: {task.status}</p>
              <p>Priority: {task.priority}</p>
            </div>
            <div className="task-card-actions">
              <Link to={`/tasks/${task.id}`}>Open</Link>
            </div>
          </article>
        ))}

        {!loading && tasks.length === 0 ? <p>No tasks found.</p> : null}
      </div>
    </div>
  );
}
