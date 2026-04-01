import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import useAuthStore from '../../auth/store/useAuthStore';
import useProjectsStore from '../../projects/store/useProjectsStore';
import TaskForm from '../components/TaskForm';
import useTasksStore from '../store/useTasksStore';

export default function TaskCreatePage() {
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const { projects, fetchProjects } = useProjectsStore();
  const { saving, error, createTask, clearError } = useTasksStore();

  useEffect(() => {
    fetchProjects({ mine: role === 'employee' });
  }, [fetchProjects, role]);

  const handleCreate = async (payload) => {
    const result = await createTask(payload);
    if (result.ok) {
      navigate(`/tasks/${result.data.id}`, { replace: true });
    }
  };

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div>
          <h1>Create Task</h1>
          <p>Create a task with backend-supported fields.</p>
        </div>
      </div>

      {error ? (
        <p className="error-text" onClick={clearError}>
          {error}
        </p>
      ) : null}

      <TaskForm mode="create" projects={projects} onSubmit={handleCreate} saving={saving} />
    </div>
  );
}
