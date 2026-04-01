import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import useAuthStore from '../../auth/store/useAuthStore';
import MemberManager from '../components/MemberManager';
import ProjectForm from '../components/ProjectForm';
import useProjectsStore from '../store/useProjectsStore';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const projectId = Number(id);
  const navigate = useNavigate();

  const { role } = useAuthStore();
  const {
    loading,
    saving,
    error,
    selectedProject,
    fetchProjectDetail,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
    clearError,
  } = useProjectsStore();

  useEffect(() => {
    if (Number.isFinite(projectId) && projectId > 0) {
      fetchProjectDetail(projectId);
    }
  }, [fetchProjectDetail, projectId]);

  const canEdit = role === 'admin' || role === 'manager';

  const handleUpdate = async (payload) => {
    await updateProject(projectId, payload);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this project?')) {
      return;
    }

    const result = await deleteProject(projectId);
    if (result.ok) {
      navigate('/projects', { replace: true });
    }
  };

  const handleAddMember = async (userId) => {
    await addMember(projectId, userId);
  };

  const handleRemoveMember = async (userId) => {
    await removeMember(projectId, userId);
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
        <h1 style={{ marginBottom: 0 }}>Project Detail</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1.5rem' }}>
        <p style={{ marginBottom: 0, color: '#6b7280', fontSize: '0.95rem' }}>
          Project ID: {projectId}
        </p>
        {canEdit ? (
          <button
            onClick={handleDelete}
            className="main-action-btn"
            disabled={saving}
            style={{ marginLeft: 'auto' }}
          >
            {saving ? 'Working...' : 'Delete Project'}
          </button>
        ) : null}
      </div>

      {loading ? <p>Loading project...</p> : null}
      {error ? (
        <p className="error-text" onClick={clearError}>
          {error}
        </p>
      ) : null}

      {selectedProject ? (
        <>
          <div className="project-detail-card">
            <h2>{selectedProject.name}</h2>
            <p>Status: {selectedProject.status || 'n/a'}</p>
            <p>
              Manager:{' '}
              {selectedProject.manager_detail?.username || selectedProject.manager || 'n/a'}
            </p>
            <p>
              Members Count: {selectedProject.members_count ?? selectedProject.members?.length ?? 0}
            </p>
          </div>

          {canEdit ? (
            <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
              <div style={{ flex: 1 }}>
                <ProjectForm
                  mode="update"
                  initialValues={{
                    name: selectedProject.name,
                    status: selectedProject.status,
                    start_date: selectedProject.start_date,
                    end_date: selectedProject.end_date,
                  }}
                  saving={saving}
                  onSubmit={handleUpdate}
                />
              </div>
              <div style={{ flex: 1 }}>
                <MemberManager
                  projectId={projectId}
                  saving={saving}
                  onAddMember={handleAddMember}
                  onRemoveMember={handleRemoveMember}
                />
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
