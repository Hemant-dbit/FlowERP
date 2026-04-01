import { create } from 'zustand';

import {
  createTaskApi,
  createTaskCommentApi,
  deleteTaskApi,
  getMyTasksApi,
  getTaskCommentsApi,
  getTaskDetailApi,
  getTasksApi,
  updateTaskApi,
} from '../api/tasksApi';

const initialState = {
  loading: false,
  saving: false,
  tasks: [],
  selectedTask: null,
  comments: [],
  error: null,
};

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;

  if (typeof data?.detail === 'string') return data.detail;
  if (typeof data === 'string') return data;

  if (data && typeof data === 'object') {
    const firstKey = Object.keys(data)[0];
    const firstValue = data[firstKey];
    if (Array.isArray(firstValue) && firstValue.length > 0) return `${firstKey}: ${firstValue[0]}`;
    if (typeof firstValue === 'string') return `${firstKey}: ${firstValue}`;
  }

  return error?.message || fallback;
}

const useTasksStore = create((set, get) => ({
  ...initialState,

  clearError: () => set({ error: null }),
  clearSelectedTask: () => set({ selectedTask: null, comments: [] }),

  fetchTasks: async ({ mine = false } = {}) => {
    set({ loading: true, error: null });
    try {
      const tasks = mine ? await getMyTasksApi() : await getTasksApi();
      set({ loading: false, tasks: Array.isArray(tasks) ? tasks : [] });
    } catch (error) {
      set({ loading: false, tasks: [], error: getErrorMessage(error, 'Failed to load tasks') });
    }
  },

  fetchTaskDetail: async (taskId) => {
    set({ loading: true, error: null });
    try {
      const [task, comments] = await Promise.all([
        getTaskDetailApi(taskId),
        getTaskCommentsApi(taskId),
      ]);
      set({
        loading: false,
        selectedTask: task,
        comments: Array.isArray(comments) ? comments : [],
      });
    } catch (error) {
      set({
        loading: false,
        selectedTask: null,
        comments: [],
        error: getErrorMessage(error, 'Failed to load task detail'),
      });
    }
  },

  createTask: async (payload) => {
    set({ saving: true, error: null });
    try {
      const task = await createTaskApi(payload);
      set((state) => ({ saving: false, tasks: [task, ...state.tasks] }));
      return { ok: true, data: task };
    } catch (error) {
      set({ saving: false, error: getErrorMessage(error, 'Failed to create task') });
      return { ok: false, error };
    }
  },

  updateTask: async (taskId, payload) => {
    set({ saving: true, error: null });
    try {
      const updated = await updateTaskApi(taskId, payload);
      set((state) => ({
        saving: false,
        tasks: state.tasks.map((task) => (task.id === updated.id ? { ...task, ...updated } : task)),
        selectedTask:
          state.selectedTask?.id === updated.id
            ? { ...state.selectedTask, ...updated }
            : state.selectedTask,
      }));
      return { ok: true, data: updated };
    } catch (error) {
      set({ saving: false, error: getErrorMessage(error, 'Failed to update task') });
      return { ok: false, error };
    }
  },

  deleteTask: async (taskId) => {
    set({ saving: true, error: null });
    try {
      await deleteTaskApi(taskId);
      set((state) => ({
        saving: false,
        tasks: state.tasks.filter((task) => task.id !== taskId),
        selectedTask: state.selectedTask?.id === taskId ? null : state.selectedTask,
        comments: state.selectedTask?.id === taskId ? [] : state.comments,
      }));
      return { ok: true };
    } catch (error) {
      set({ saving: false, error: getErrorMessage(error, 'Failed to delete task') });
      return { ok: false, error };
    }
  },

  createComment: async (taskId, content) => {
    set({ saving: true, error: null });
    try {
      const comment = await createTaskCommentApi(taskId, { task: taskId, content });
      set((state) => ({ saving: false, comments: [...state.comments, comment] }));
      return { ok: true, data: comment };
    } catch (error) {
      set({ saving: false, error: getErrorMessage(error, 'Failed to add comment') });
      return { ok: false, error };
    }
  },
}));

export default useTasksStore;
