import { Link, useNavigate } from 'react-router-dom';

import ProjectForm from '../components/ProjectForm';
import useProjectsStore from '../store/useProjectsStore';

export default function ProjectCreatePage() {
  const navigate = useNavigate();
  const { saving, error, createProject, clearError } = useProjectsStore();

  const handleCreate = async (payload) => {
    const result = await createProject(payload);
    if (result.ok) {
      navigate(`/projects/${result.data.id}`, { replace: true });
    }
  };

  return (
    <div className="projects-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: 0 }}>
        <Link
          to="/projects"
          className="back-dashboard-btn"
          style={{
            background: 'none',
            color: '#3730a3',
            fontSize: '1.7rem',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            padding: '0.45rem 0.65rem',
          }}
        >
          ←
        </Link>
        <h1 style={{ marginBottom: 0 }}>Create Project</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1.5rem' }}>
        <p style={{ marginBottom: 0, color: '#6b7280', fontSize: '0.95rem' }}>
          Create a new project and assign members
        </p>
      </div>

      {error ? (
        <p className="error-text" onClick={clearError}>
          {error}
        </p>
      ) : null}

      <ProjectForm mode="create" saving={saving} onSubmit={handleCreate} />
    </div>
  );
}
