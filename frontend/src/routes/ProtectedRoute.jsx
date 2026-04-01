import { Navigate, Outlet, useLocation } from 'react-router-dom'

import useAuthStore from '../modules/auth/store/useAuthStore'

export default function ProtectedRoute() {
  const location = useLocation()
  const { initialized, isAuthenticated } = useAuthStore()

  if (!initialized) {
    return <div className="center-message">Checking session...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
