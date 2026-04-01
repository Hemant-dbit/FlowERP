import { apiDelete, apiGet, apiPost } from '../../../services/api';
import ENDPOINTS from '../../../services/endpoints';

export function getActivityLogsApi(filters = {}) {
  return apiGet(ENDPOINTS.activityLogs.list, { params: filters });
}

export function getMyActivityLogsApi() {
  return apiGet(ENDPOINTS.activityLogs.myLogs);
}

export function getActivityLogDetailApi(logId) {
  return apiGet(ENDPOINTS.activityLogs.detail(logId));
}

export function createActivityLogApi(payload) {
  return apiPost(ENDPOINTS.activityLogs.create, payload);
}

export function deleteActivityLogApi(logId) {
  return apiDelete(ENDPOINTS.activityLogs.delete(logId));
}

export function getActivityLogStatsApi() {
  return apiGet(ENDPOINTS.activityLogs.stats);
}
