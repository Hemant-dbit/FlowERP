import { useEffect } from 'react'

import DashboardContent from '../components/DashboardContent'
import useDashboardStore from '../store/useDashboardStore'
import { ROLES } from '../../../shared/constants/roles'

export default function ManagerDashboardPage() {
  const { fetchDashboardData } = useDashboardStore()

  useEffect(() => {
    fetchDashboardData(ROLES.MANAGER)
  }, [fetchDashboardData])

  return <DashboardContent title="Manager Dashboard" subtitle="Team progress and operational insights" showManagerWidgets />
}
