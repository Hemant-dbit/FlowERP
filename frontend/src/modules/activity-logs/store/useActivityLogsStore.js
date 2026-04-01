import { create } from 'zustand';

import {
  deleteActivityLogApi,
  getActivityLogStatsApi,
  getActivityLogsApi,
  getMyActivityLogsApi,
} from '../api/activityLogsApi';

const initialState = {
  loading: false,
  saving: false,
  logs: [],
  stats: null,
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

const useActivityLogsStore = create((set) => ({
  ...initialState,

  clearError: () => set({ error: null }),

  fetchLogs: async ({ myOnly = false, filters = {} } = {}) => {
    set({ loading: true, error: null });
    try {
      const logs = myOnly ? await getMyActivityLogsApi() : await getActivityLogsApi(filters);
      set({ loading: false, logs: Array.isArray(logs) ? logs : [] });
    } catch (error) {
      set({
        loading: false,
        logs: [],
        error: getErrorMessage(error, 'Failed to load activity logs'),
      });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await getActivityLogStatsApi();
      set({ stats });
      return { ok: true, data: stats };
    } catch (error) {
      set({ stats: null, error: getErrorMessage(error, 'Failed to load activity statistics') });
      return { ok: false, error };
    }
  },

  deleteLog: async (logId) => {
    set({ saving: true, error: null });
    try {
      await deleteActivityLogApi(logId);
      set((state) => ({
        saving: false,
        logs: state.logs.filter((log) => log.id !== logId),
      }));
      return { ok: true };
    } catch (error) {
      set({ saving: false, error: getErrorMessage(error, 'Failed to delete activity log') });
      return { ok: false, error };
    }
  },
}));

export default useActivityLogsStore;
