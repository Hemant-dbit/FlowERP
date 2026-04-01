export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
}

export const DASHBOARD_PATH_BY_ROLE = {
  [ROLES.ADMIN]: '/dashboard/admin',
  [ROLES.MANAGER]: '/dashboard/manager',
  [ROLES.EMPLOYEE]: '/dashboard/employee',
}

export const DEFAULT_ROLE = ROLES.EMPLOYEE
