import { apiDelete, apiGet, apiPatch, apiPost } from '../../../services/api'
import ENDPOINTS from '../../../services/endpoints'

export function getProjectsApi() {
  return apiGet(ENDPOINTS.projects.list)
}

export function getMyProjectsApi() {
  return apiGet(ENDPOINTS.projects.myProjects)
}

export function getProjectDetailApi(projectId) {
  return apiGet(ENDPOINTS.projects.detail(projectId))
}

export function createProjectApi(payload) {
  return apiPost(ENDPOINTS.projects.create, payload)
}

export function updateProjectApi(projectId, payload) {
  return apiPatch(ENDPOINTS.projects.update(projectId), payload)
}

export function deleteProjectApi(projectId) {
  return apiDelete(ENDPOINTS.projects.delete(projectId))
}

export function addProjectMemberApi(projectId, userId) {
  return apiPost(ENDPOINTS.projects.addMember(projectId), { user_id: userId })
}

export function removeProjectMemberApi(projectId, userId) {
  return apiPost(ENDPOINTS.projects.removeMember(projectId), { user_id: userId })
}
