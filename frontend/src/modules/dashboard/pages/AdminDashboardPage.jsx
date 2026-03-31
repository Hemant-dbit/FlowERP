import { useEffect } from 'react'

import DashboardContent from '../components/DashboardContent'
import useDashboardStore from '../store/useDashboardStore'
import { ROLES } from '../../../shared/constants/roles'

export default function AdminDashboardPage() {
  const { fetchDashboardData } = useDashboardStore()

  useEffect(() => {
    fetchDashboardData(ROLES.ADMIN)
  }, [fetchDashboardData])

  return <DashboardContent title="Admin Dashboard" subtitle="System-wide visibility and controls" showManagerWidgets />
}
