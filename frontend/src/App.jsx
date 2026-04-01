import { useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'

import { offAuthExpired, onAuthExpired } from './app/eventBus'
import useAuthStore from './modules/auth/store/useAuthStore'
import AppRoutes from './routes/AppRoutes'
import './App.css'

export default function App() {
  const { initializeAuth, forceLogout } = useAuthStore()

  useEffect(() => {
    initializeAuth()

    const handleAuthExpired = () => {
      forceLogout()
    }

    onAuthExpired(handleAuthExpired)
    return () => offAuthExpired(handleAuthExpired)
  }, [forceLogout, initializeAuth])

  return (
    <Router>
      <AppRoutes />
    </Router>
  )
}
