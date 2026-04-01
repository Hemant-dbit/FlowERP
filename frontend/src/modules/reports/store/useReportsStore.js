import { create } from 'zustand';
import {
  getOverviewReportApi,
  getTasksByStatusReportApi,
  getEmployeeWorkloadReportApi,
  getProjectProgressReportApi,
  getWeeklyCompletionsReportApi,
  getDepartmentSummaryReportApi,
  getMyDashboardReportApi,
} from '../api/reportsApi';

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;
  if (typeof data?.detail === 'string') return data.detail;
  if (typeof data === 'string') return data;
  return error?.message || fallback;
}

const useReportsStore = create((set) => ({
  loading: false,
  error: null,
  overview: null,
  tasksByStatus: null,
  employeeWorkload: null,
  projectProgress: null,
  weeklyCompletions: null,
  departmentSummary: null,
  myDashboard: null,

  clearError: () => set({ error: null }),

  fetchOverview: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getOverviewReportApi();
      set({ loading: false, overview: data });
    } catch (error) {
      set({
        loading: false,
        overview: null,
        error: getErrorMessage(error, 'Failed to load overview report'),
      });
    }
  },
  fetchTasksByStatus: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getTasksByStatusReportApi();
      set({ loading: false, tasksByStatus: data });
    } catch (error) {
      set({
        loading: false,
        tasksByStatus: null,
        error: getErrorMessage(error, 'Failed to load tasks by status report'),
      });
    }
  },
  fetchEmployeeWorkload: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getEmployeeWorkloadReportApi();
      set({ loading: false, employeeWorkload: data });
    } catch (error) {
      set({
        loading: false,
        employeeWorkload: null,
        error: getErrorMessage(error, 'Failed to load employee workload report'),
      });
    }
  },
  fetchProjectProgress: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getProjectProgressReportApi();
      set({ loading: false, projectProgress: data });
    } catch (error) {
      set({
        loading: false,
        projectProgress: null,
        error: getErrorMessage(error, 'Failed to load project progress report'),
      });
    }
  },
  fetchWeeklyCompletions: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getWeeklyCompletionsReportApi();
      set({ loading: false, weeklyCompletions: data });
    } catch (error) {
      set({
        loading: false,
        weeklyCompletions: null,
        error: getErrorMessage(error, 'Failed to load weekly completions report'),
      });
    }
  },
  fetchDepartmentSummary: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getDepartmentSummaryReportApi();
      set({ loading: false, departmentSummary: data });
    } catch (error) {
      set({
        loading: false,
        departmentSummary: null,
        error: getErrorMessage(error, 'Failed to load department summary report'),
      });
    }
  },
  fetchMyDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getMyDashboardReportApi();
      set({ loading: false, myDashboard: data });
    } catch (error) {
      set({
        loading: false,
        myDashboard: null,
        error: getErrorMessage(error, 'Failed to load my dashboard report'),
      });
    }
  },
}));

export default useReportsStore;
