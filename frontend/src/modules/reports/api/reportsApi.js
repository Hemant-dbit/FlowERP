import { apiGet } from '../../../services/api';
import ENDPOINTS from '../../../services/endpoints';

export function getOverviewReportApi() {
  return apiGet(ENDPOINTS.reports.overview);
}

export function getTasksByStatusReportApi() {
  return apiGet(ENDPOINTS.reports.tasksByStatus);
}

export function getEmployeeWorkloadReportApi() {
  return apiGet(ENDPOINTS.reports.employeeWorkload);
}

export function getProjectProgressReportApi() {
  return apiGet(ENDPOINTS.reports.projectProgress);
}

export function getWeeklyCompletionsReportApi() {
  return apiGet(ENDPOINTS.reports.weeklyCompletions);
}

export function getDepartmentSummaryReportApi() {
  return apiGet(ENDPOINTS.reports.departmentSummary);
}

export function getMyDashboardReportApi() {
  return apiGet(ENDPOINTS.reports.myDashboard);
}
