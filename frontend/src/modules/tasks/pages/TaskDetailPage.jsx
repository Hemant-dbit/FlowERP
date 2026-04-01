import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import useAuthStore from '../../auth/store/useAuthStore';
import useProjectsStore from '../../projects/store/useProjectsStore';
import CommentSection from '../components/CommentSection';
import TaskForm from '../components/TaskForm';
import useTasksStore from '../store/useTasksStore';

export default function TaskDetailPage() {
  const { id } = useParams();
  const taskId = Number(id);
  const navigate = useNavigate();

  const { role } = useAuthStore();
  const { projects, fetchProjects } = useProjectsStore();
  const {
    loading,
    saving,
    error,
    selectedTask,
    comments,
    fetchTaskDetail,
    updateTask,
    deleteTask,
    createComment,
    clearError,
  } = useTasksStore();

  useEffect(() => {
    if (Number.isFinite(taskId) && taskId > 0) {
      fetchTaskDetail(taskId);
      fetchProjects({ mine: role === 'employee' });
    }
  }, [fetchTaskDetail, fetchProjects, role, taskId]);

  const handleUpdate = async (payload) => {
    await updateTask(taskId, payload);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    const result = await deleteTask(taskId);
    if (result.ok) {
      navigate('/tasks', { replace: true });
    }
  };

  const handleCreateComment = async (content) => {
    return createComment(taskId, content);
  };

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div>
          <h1>Task Detail</h1>
          <p>Task ID: {taskId}</p>
        </div>
        <div className="tasks-header-actions">
          <Link to="/tasks">Back to Tasks</Link>
          <button onClick={handleDelete} disabled={saving}>
            {saving ? 'Working...' : 'Delete Task'}
          </button>
        </div>
      </div>

      {loading ? <p>Loading task...</p> : null}
      {error ? (
        <p className="error-text" onClick={clearError}>
          {error}
        </p>
      ) : null}

      {selectedTask ? (
        <>
          <div className="task-detail-card">
            <h2>{selectedTask.title}</h2>
            <p>Project: {selectedTask.project_name || selectedTask.project}</p>
            <p>Status: {selectedTask.status}</p>
            <p>Priority: {selectedTask.priority}</p>
            <p>
              Assigned To:{' '}
              {selectedTask.assigned_to_detail?.username ||
                selectedTask.assigned_to ||
                'Unassigned'}
            </p>
          </div>

          <TaskForm
            mode="update"
            initialValues={{
              title: selectedTask.title,
              project: selectedTask.project,
              assigned_to: selectedTask.assigned_to,
              parent_task: selectedTask.parent_task,
              status: selectedTask.status,
              priority: selectedTask.priority,
              deadline: selectedTask.deadline ? String(selectedTask.deadline).slice(0, 16) : '',
            }}
            projects={projects}
            onSubmit={handleUpdate}
            saving={saving}
          />

          <CommentSection
            comments={comments}
            saving={saving}
            onSubmitComment={handleCreateComment}
          />
        </>
      ) : null}
    </div>
  );
}
