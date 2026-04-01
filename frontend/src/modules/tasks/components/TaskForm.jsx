import { useMemo, useState } from 'react';

const DEFAULT_FORM = {
  title: '',
  project: '',
  assigned_to: '',
  parent_task: '',
  status: 'pending',
  priority: 2,
  deadline: '',
};

export default function TaskForm({
  mode = 'create',
  initialValues,
  projects = [],
  onSubmit,
  saving,
}) {
  const mergedInitial = useMemo(
    () => ({ ...DEFAULT_FORM, ...(initialValues || {}) }),
    [initialValues]
  );
  const [form, setForm] = useState(mergedInitial);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      title: form.title.trim(),
      project: Number(form.project),
      assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
      parent_task: form.parent_task ? Number(form.parent_task) : null,
      status: form.status,
      priority: Number(form.priority),
      deadline: form.deadline || null,
    };

    await onSubmit(payload);
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2>{mode === 'create' ? 'Create Task' : 'Update Task'}</h2>

      <label htmlFor="task-title">Title</label>
      <input id="task-title" name="title" value={form.title} onChange={handleChange} required />

      <label htmlFor="task-project">Project</label>
      <select
        id="task-project"
        name="project"
        value={form.project}
        onChange={handleChange}
        required
      >
        <option value="">Select project</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>

      <label htmlFor="task-assigned-to">Assigned User ID (optional)</label>
      <input
        id="task-assigned-to"
        name="assigned_to"
        type="number"
        min="1"
        value={form.assigned_to || ''}
        onChange={handleChange}
      />

      <label htmlFor="task-parent">Parent Task ID (optional)</label>
      <input
        id="task-parent"
        name="parent_task"
        type="number"
        min="1"
        value={form.parent_task || ''}
        onChange={handleChange}
      />

      <label htmlFor="task-status">Status</label>
      <select id="task-status" name="status" value={form.status} onChange={handleChange}>
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="blocked">Blocked</option>
      </select>

      <label htmlFor="task-priority">Priority</label>
      <select id="task-priority" name="priority" value={form.priority} onChange={handleChange}>
        <option value={1}>Low</option>
        <option value={2}>Medium</option>
        <option value={3}>High</option>
        <option value={4}>Critical</option>
      </select>

      <label htmlFor="task-deadline">Deadline (optional)</label>
      <input
        id="task-deadline"
        name="deadline"
        type="datetime-local"
        value={form.deadline || ''}
        onChange={handleChange}
      />

      <button type="submit" disabled={saving}>
        {saving ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
      </button>
    </form>
  );
}
