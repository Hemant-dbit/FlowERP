import { apiDelete, apiGet, apiPatch, apiPost } from '../../../services/api';
import ENDPOINTS from '../../../services/endpoints';

export function getEmployeesApi() {
  return apiGet(ENDPOINTS.employees.list);
}

export function getEmployeeDetailApi(employeeId) {
  return apiGet(ENDPOINTS.employees.detail(employeeId));
}

export function createEmployeeApi(payload) {
  return apiPost(ENDPOINTS.employees.create, payload);
}

export function updateEmployeeApi(employeeId, payload) {
  return apiPatch(ENDPOINTS.employees.update(employeeId), payload);
}

export function deleteEmployeeApi(employeeId) {
  return apiDelete(ENDPOINTS.employees.delete(employeeId));
}

export function getMyEmployeeProfileApi() {
  return apiGet(ENDPOINTS.employees.me);
}
