import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../auth/store/useAuthStore';
import { DASHBOARD_PATH_BY_ROLE, ROLES } from '../../../shared/constants/roles';
import useProjectsStore from '../store/useProjectsStore';

export default function ProjectsPage() {
  const { role } = useAuthStore();
  const { loading, error, projects, fetchProjects, clearError } = useProjectsStore();
  const dashboardPath = DASHBOARD_PATH_BY_ROLE[role] || DASHBOARD_PATH_BY_ROLE[ROLES.EMPLOYEE];

  useEffect(() => {
    fetchProjects({ mine: role === 'employee' });
  }, [fetchProjects, role]);

  return (
    <div className="projects-page">
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
        <h1 style={{ margin: 0, fontSize: '2rem', lineHeight: 1.1 }}>Projects</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: 0 }}>
        <p style={{ margin: 0, fontSize: '1.08rem', color: '#555', flex: 1 }}>
          {role === 'employee' ? 'Projects assigned to you' : 'All accessible projects'}
        </p>
        {role !== 'employee' ? (
          <Link to="/projects/new" className="main-action-btn">
            Create Project
          </Link>
        ) : null}
      </div>

      {error ? (
        <p className="error-text" onClick={clearError}>
          {error}
        </p>
      ) : null}

      <div className="project-list">
        {projects.map((project) => (
          <article className="project-card" key={project.id}>
            <div>
              <h3>{project.name}</h3>
              <p>Status: {project.status || 'n/a'}</p>
              <p>Manager: {project.manager_name || project.manager_detail?.username || 'n/a'}</p>
              <p>Members: {project.members_count ?? project.members?.length ?? 0}</p>
            </div>
            <div className="project-card-actions">
              <Link to={`/projects/${project.id}`}>Open</Link>
            </div>
          </article>
        ))}

        {!loading && projects.length === 0 ? <p>No projects found.</p> : null}
      </div>
    </div>
  );
}
