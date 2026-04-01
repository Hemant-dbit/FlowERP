import { apiDelete, apiGet, apiPatch, apiPost } from '../../../services/api'
import ENDPOINTS from '../../../services/endpoints'

export function getTasksApi() {
  return apiGet(ENDPOINTS.tasks.list)
}

export function getMyTasksApi() {
  return apiGet(ENDPOINTS.tasks.myTasks)
}

export function getTaskDetailApi(taskId) {
  return apiGet(ENDPOINTS.tasks.detail(taskId))
}

export function createTaskApi(payload) {
  return apiPost(ENDPOINTS.tasks.create, payload)
}

export function updateTaskApi(taskId, payload) {
  return apiPatch(ENDPOINTS.tasks.update(taskId), payload)
}

export function deleteTaskApi(taskId) {
  return apiDelete(ENDPOINTS.tasks.delete(taskId))
}

export function getTaskCommentsApi(taskId) {
  return apiGet(ENDPOINTS.tasks.comments(taskId))
}

export function createTaskCommentApi(taskId, payload) {
  return apiPost(ENDPOINTS.tasks.createComment(taskId), payload)
}
