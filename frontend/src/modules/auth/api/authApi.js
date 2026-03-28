import { apiGet, apiPost } from '../../../services/api'
import ENDPOINTS from '../../../services/endpoints'

export function loginApi(payload) {
  return apiPost(ENDPOINTS.auth.login, payload)
}

export function refreshApi(payload) {
  return apiPost(ENDPOINTS.auth.refresh, payload)
}

export function registerApi(payload) {
  return apiPost(ENDPOINTS.auth.register, payload)
}

export function logoutApi(payload) {
  return apiPost(ENDPOINTS.auth.logout, payload)
}

export function currentUserApi() {
  return apiGet(ENDPOINTS.auth.me)
}
