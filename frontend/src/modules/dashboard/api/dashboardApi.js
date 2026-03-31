import { apiGet } from '../../../services/api'
import ENDPOINTS from '../../../services/endpoints'

export function getMyDashboardApi() {
  return apiGet(ENDPOINTS.reports.myDashboard)
}

export function getOverviewReportApi() {
  return apiGet(ENDPOINTS.reports.overview)
}

export function getTasksByStatusApi() {
  return apiGet(ENDPOINTS.reports.tasksByStatus)
}

export function getProjectProgressApi() {
  return apiGet(ENDPOINTS.reports.projectProgress)
}
