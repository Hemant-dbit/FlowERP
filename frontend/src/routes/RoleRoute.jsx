import { Navigate, Outlet } from 'react-router-dom'

import useAuthStore from '../modules/auth/store/useAuthStore'

export default function RoleRoute({ allowedRoles = [] }) {
  const { role, initialized, isAuthenticated } = useAuthStore()

  const roleList = Array.isArray(allowedRoles)
    ? allowedRoles
    : allowedRoles
      ? [allowedRoles]
      : []

  const allowedRolesSet = new Set(roleList)

  if (!initialized) {
    return <div className="center-message">Checking permissions...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRolesSet.size > 0 && !allowedRolesSet.has(role)) {
    return <Navigate to="/forbidden" replace />
  }

  return <Outlet />
}
